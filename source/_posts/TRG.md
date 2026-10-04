---
title: TRG Code
date: 2022-04-05 10:56:42
tags: ['Numerical Physics','Code','物理']
categories: code
---



This is the code for calculating the partition function of 2D Ising model, using TRG(Tensor Renormalization Group)  algorithm. The notes of this method might be updated in the future.

<!--more-->

```python
'''
Created by Richard Liu
This is a typical Tensor Renormalisation Group(TRG) program trying to solve the calssical Ising model without magnetical field
the Hamitonian is H = \sum_{\sigma_i,\sigma_j}J*\sigma_i*\sigma_j,
for classical model,\sigma is 1 or -1
the system is supposed to be a 2D square
'''
import numpy as np
import torch
import math
# parameter
J = 1
beta = math.log(1+math.sqrt(2))/2   #critical point temporature from wiki
std = 0.929695398341610
ira = 20
trunc = 25
norm =[]

# making B into UV(unfinished)
B = np.exp([[-1*beta*J,beta*J],[beta*J,-1*beta*J]])
U,S_tem,V = np.linalg.svd(B) #B = USV
S_tem = np.diag(np.sqrt(S_tem))
U = np.dot(U,S_tem)
U = torch.from_numpy(U)
V = np.dot(S_tem,V)
V = torch.from_numpy(V)

# calculating A_0 tensor
#---------------------------------------------------
#   U
# V-A-U     making this to become A_0   #init
#   V
#---------------------------------------------------
A = torch.zeros(2,2,2,2,dtype=float) #the sequence order is left-right-up-down
A[0][0][0][0] = 1
A[1][1][1][1] = 1 
A = torch.einsum('mi,ijkl -> mjkl',V,A)
A = torch.einsum('ijkl,jm -> imkl',A,U)
A = torch.einsum('ijkl,km -> ijml',A,U)
A = torch.einsum('ml,ijkl -> ijkm',V,A)

#---------------------------------------------------
#   *-----*-----*
#   |     2     |
#   *--0--*--1--*     #SVD for the vertex
#   |     3     |
#   *-----*-----*
#---------------------------------------------------
#calculating A_n tensor
for i in range(ira):
    tem = A.permute(0,2,1,3)
    num_con = A.size(dim=1)
    num_S = num_con**2
    if trunc<num_S:
        #from left-up to right-down
        U_lef_up,S1,V_rig_down = torch.linalg.svd(tem.reshape(num_S,num_S))
        S1_topk = torch.topk(S1,trunc)
        idx = S1_topk[1]
        U_lef_up = torch.index_select(U_lef_up,1,idx)
        U_lef_up = U_lef_up.reshape(num_con,num_con,trunc)
        V_rig_down = torch.index_select(V_rig_down,0,idx)
        V_rig_down = V_rig_down.reshape(trunc,num_con,num_con)

        S1 = S1_topk[0]
        c = torch.norm(S1)
        S1 = S1/c
        S1 = torch.diag(torch.sqrt(S1))
        c = torch.log(c)/(2**(i+1))
        norm.append(c)

        U_lef_up = torch.einsum('ijk,kl -> ijl',U_lef_up,S1)
        V_rig_down = torch.einsum('il,ljk ->ijk',S1,V_rig_down)
        #from left-down to right-up
        tem = A.permute(0,3,1,2)
        U_lef_down,S2,V_rig_up = torch.linalg.svd(tem.reshape(num_S,num_S))
        S2_topk = torch.topk(S2,trunc)
        idx = S2_topk[1]
        U_lef_down = torch.index_select(U_lef_down,1,idx)
        U_lef_down = U_lef_down.reshape(num_con,num_con,trunc)
        V_rig_up = torch.index_select(V_rig_up,0,idx)
        V_rig_up = V_rig_up.reshape(trunc,num_con,num_con)

        S2 = S2_topk[0]
        c = torch.norm(S2)
        S2 = S2/c
        S2 = torch.diag(torch.sqrt(S2))
        c = torch.log(c)/(2**(i+1))
        norm.append(c)

        U_lef_down = torch.einsum('ijk,kl -> ijl',U_lef_down,S2)
        V_rig_up = torch.einsum('il,ijk -> ljk',S2,V_rig_up)
    else:
        #from left-up to right-down
        U_lef_up,S1,V_rig_down = torch.linalg.svd(tem.reshape(num_S,num_S))
        U_lef_up = U_lef_up.reshape(num_con,num_con,num_S)
        V_rig_down = V_rig_down.reshape(num_S,num_con,num_con)
        c = torch.norm(S1)
        S1 = S1/c
        S1 = torch.diag(torch.sqrt(S1))
        c = torch.log(c)/(2**(i+1))
        # print(c)    #test
        norm.append(c)
        U_lef_up = torch.einsum('ijk,kl -> ijl',U_lef_up,S1)
        V_rig_down = torch.einsum('il,ijk ->ljk',S1,V_rig_down)
        #from left-down to right-up
        tem = A.permute(0,3,1,2)
        U_lef_down,S2,V_rig_up = torch.linalg.svd(tem.reshape(num_S,num_S))
        U_lef_down = U_lef_down.reshape(num_con,num_con,num_S)
        V_rig_up = V_rig_up.reshape(num_S,num_con,num_con)
        c = torch.norm(S2)
        S2=S2/c
        S2 = torch.diag(torch.sqrt(S2))
        c = torch.log(c)/(2**(i+1))
        # print(c)    #test
        norm.append(c)
        U_lef_down = torch.einsum('ijk,kl -> ijl',U_lef_down,S2)
        V_rig_up = torch.einsum('il,ijk -> ljk',S2,V_rig_up)
    #CONTRACTION
    tem = torch.einsum('ijk,lmk -> ijlm',V_rig_down,V_rig_up)
    tem = torch.einsum('ijlm,jno ->ilmno',tem,U_lef_down)
    A = torch.einsum('ilmno,mns ->isol',tem,U_lef_up)
ans = torch.einsum('iijj ->',A)
ans = torch.log(ans)/2**ira
for i in norm:
    ans += i
print("最大保留态数目：%d" %trunc)
print("迭代次数：%d" %ira)
print("配分函数ln(Z)/N的数值解为：%.7f" %ans)
print("在临界点处与解析解的相对误差为：%g" %abs(ans-std))
```

