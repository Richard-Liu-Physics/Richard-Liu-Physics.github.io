---
title: From Matrix Product State(MPS) to DMRG（1）
date: 2022-04-03 09:53:00
tags: ['Numerical Physics','物理']
categories: Numerical Physics
mathjax: true
---

This note is originally from review article *arXiv:1008.3477v2*. Notice: This note is written in Chinese.

<!--more-->

## SVD/QR分解

MPS表达式的基础是奇异值分解(*Singular value decomposition*)保证对任意$N_A \times N_B$矩阵$M$，记$N_C = \min \{N_A,N_B\}$，存在$U \in \mathsf{M}_{(N_A,N_C)},V^{\dagger} \in \mathsf{M} _{(N_C,N_B)} $使得
$$
M = USV^{\dagger}
$$
其中$U^{\dagger}U = I,V^{\dagger}V = I$，$S$为对角阵，对角元大小按照顺序依次次下降$S_{11} \ge S_{22} \ge \cdots \ge S_{nn}\ge 0$，我们称矩阵$S$的秩$r$为*Schmidt rank*。在此基础上，如果我们需要对矩阵$M$进行更低维度$r'(r' < r)$的近似，我们有取$S'=diag(S_{11},\cdots, S_{r'r'},\cdots)，M' = US’V^{\dagger}$，则在Frobenius范数(2-norm)诱导出的内积$\left\langle M|N \right \rangle = Tr (M^{\dagger}N)$下，不难验证$M'$是维度为$r'$时对$M$的最佳近似（请思考如何得出这个结论的）。

作为奇异值分解的应用，我们对由两个子系统$AB$张量积形成的态空间内，任意一个量子纯态可以写成如下形式：
$$
|\psi\rangle = \sum_{i,j}\Psi_{ij}|i\rangle_{A} |j\rangle_{B}
$$
其中$|i\rangle_{A}, |j\rangle_{B}$分别为AB子系统里的一组正交归一基。显然此时我们可以将$\Psi_{ij}$看成一个矩阵，对其做SVD分解有：
$$
\begin{align}
|\psi\rangle &=\sum_{i,j}\sum^{N_C}_{a=1}U_{ia}S_{aa}V_{ja}^{*}|i\rangle_{A} |j\rangle_{B}\\
&= \sum^{N_C}_{a=1}(\sum_i U_{ia}|i\rangle_{A})S_{aa}(\sum_j V^*_{ja}|j\rangle_{B})\\
&= \sum^{N_C}_{a=1}S_{aa}|a\rangle_{A}|a\rangle_{B}\\
&= \sum^{r}_{a=1}S_{aa}|a\rangle_{A}|a\rangle_{B}
\end{align}
$$
由U，V矩阵的性质$U^{\dagger}U = I, V^{\dagger}V = I$我们有$|a\rangle_{A}|a\rangle_{B}$分别为AB系统中的一组正交归一向量，自然可以通过扩充得到AB系统的一组正交归一基。

同时，所谓的“把Atrance掉”，“把Btrace掉”得到的约化密度矩阵由$\Psi_{ij}$的矩阵表达有：
$$
\rho_A = Tr_B|\psi\rangle \langle \psi|= \Psi_{ij}\Psi_{ij}^{\dagger}\\
\rho_B =Tr_A|\psi\rangle \langle \psi|= \Psi_{ij}^{\dagger}\Psi_{ij}
$$
通过SVD分解我们可以将约化密度矩阵写成：
$$
\hat{\rho_A} = \sum_{a=1}^r S_{aa}^2|a\rangle_A \langle a|_A\\
\hat{\rho_B} = \sum_{a=1}^r S_{aa}^2|a\rangle_B \langle a|_B
$$
这也表明了我们在计算AB系统纠缠熵时得到的值都是相同的。在希尔伯特空间里，量子纯态$|\psi\rangle$的范数和矩阵

$\Psi_{ij}$的Frobenius范数是一样的；从而为了将$|\psi\rangle$在希尔伯特空间中更小的子空间中表示，即将$\Psi_{ij}$做更小秩的近似，最佳近似也就对应着$|\psi\rangle$的最佳近似。显然就是我们在开头所描述的M'。当然，为了概率守恒，我们需要对M'分解得到的S'做归一化。

虽然SVD分解能很好的满足我们的要求，但当我们不需要这么精确的分解的时候我们有更优的选择。我们可以做如下分解，即QR分解：
$$
M = QR, Q \in \mathsf{M}_{(N_A,N_A)}, Q^{\dagger}Q = QQ^{\dagger}= I
$$
其中R为上三角矩阵。当$N_A>N_B$时，完整的QR分解可以退化成一个thin QR decomposition，即：
$$
M = Q\cdot
\begin{bmatrix}
R_1\\
0
\end{bmatrix}
=
\begin{bmatrix}
Q_1 &Q_2
\end{bmatrix}
\begin{bmatrix}
R_1\\
0
\end{bmatrix}
=Q_1R_1, Q^{\dagger}Q = I
$$
显然$Q_1$和SVD分解中的U有一样的性质，但他们并不必须相同：这种分解方式并不是唯一的。

## MPS态

### SVD分解与MPS

我们知道，在一些情况下，希尔伯特空间中的态可以由一系列小的希尔伯特空间中的态张成，如考虑简单的多粒子自旋态，即：$|\psi\rangle =\sum_{\sigma_1,\cdots\sigma_L}c_{\sigma_1,\cdots\sigma_L}|\sigma_1,\cdots\sigma_L\rangle$，L为粒子数目。当L很大的时候，对这样一个希尔伯特空间求解是相当困难的，在有限的计算资源下是不可能实现的。作为一种compromise，我们需要找到一种表示方式，使得local的自由度较小使得局部的态的刻画变得容易，我们将采用上述提到的SVD分解，将$c_{\sigma_1,\cdots\sigma_L}$视为一个$d \times d^L$的矩阵，有：
$$
c_{\sigma_1,\cdots\sigma_L}=\sum_{a_1}^{r_1}U_{\sigma_1,a_1}S_{a_1,a_1}(V^{\dagger})_{a_1,{\sigma_2,\cdots\sigma_L}}=\sum_{a_1}^{r_1}U_{\sigma_1,a_1}c_{a_1,\sigma_2,\cdots\sigma_L}
$$
由SVD的结果，我们知道$r_1\le d$。我们将矩阵U一系列行向量$A^{\sigma_1}$单独列出，有：
$$
A^{\sigma_1}_{a_1}=U_{\sigma_1,a_1}
$$
对$c_{a_1,\sigma_2,\cdots\sigma_L}$我们将其拆为$r_1d \times d^{L-2}$同样有：
$$
c_{a_1,\sigma_2,\cdots\sigma_L}=\sum_{a_2}^{r_2}U_{(a_1)\sigma_2,a_2}S_{a_2,a_2}(V^{\dagger})c_{\sigma_3,\cdots\sigma_L}=\sum_{a_2}^{r_2}U_{(a_1,a_2)\sigma_2}c_{a_2,\sigma_3,\cdots\sigma_L}
$$
由SVD分解的结果，我们有$a_2\le r_1d\le d^2$。类似的，我们可以将$U_{(a_1)\sigma_2,a_2}$写为一系列矩阵$A^{\sigma_2}$，有：
$$
A^{\sigma_2}_{a_1,a_2}=U_{\sigma_1,(a_1,a_2)}
$$
从而，我们得到：
$$
\begin{align}
c_{\sigma_1,\cdots\sigma_L} &= \sum_{a_1,\cdots, a_{L-1}}A_{a_1}^{\sigma_1}A_{a_1,a_2}^{\sigma_2}\cdots A_{a_{L-2},a_{L-1}}^{\sigma_{L-1}}A_{a_{L-1}}^{\sigma_1}\\
&=A^{\sigma_1}A^{\sigma_2}\cdots A^{\sigma_L}
\end{align}
$$
从SVD分解的性质中我们可以得到：


$$
\begin{align}
\delta_{a_l,a_k}&=\sum_{a_{l-1}\sigma_l}(U^\dagger)_{a_l,(a_{l-1}\sigma_l)}U_{(a_{l-1}\sigma_l),a_k} \\

&=\sum_{a_{l-1}\sigma_l}(A^{\sigma_l\dagger})_{a_l,a_{l-1} }A^{\sigma_l}_{a_{l-1},a_k} \\

&= \sum_{\sigma_l}(A^{\sigma_l\dagger}A^{\sigma_l})_{ {a_l},a_k} \\
I &=\sum_{\sigma_l}A^{\sigma_l\dagger}A^{\sigma_l} \\
\tag{1}
\end{align}
$$
满足(1)式的矩阵我们称为 *left-normalized* ，矩阵乘积态（MPS）中由*left-normalized*矩阵组成的我们称为*left-canonical*的。

在将$|\psi\rangle$写为MPS态时我们需要注意到，上述计算中$\sigma_l$不能取到L。但是只要是对于归一化的态，我们通过计算MPS态的模长，我们会发现对$\sigma_l$也是成立的（这个命题是trivial的，请自行验证）。

另外可以证明，SVD分解之后$A$矩阵的最大维数为$d^{L/2-1} \times d^{L/2}$（L为奇数时严格小于此维度）。因此，实际情况下，由于矩阵维度的指数级别增长，对应纯态无法直接计算其精确的分解形式。

在DMRG方法中，我们需要将系统分为AB两个部分，因此我们有：
$$
\begin{align}

|\psi\rangle &= \sum_{a_l}[\sum_{\sigma_1,\ldots,\sigma_l}(A^{\sigma_1}\cdots A^{\sigma_l})_{1,a_l}|\sigma_1,\ldots,\sigma_l\rangle][\sum_{\sigma_{l+1},\ldots,\sigma_L}(A^{\sigma_{l+1}}\cdots A^{\sigma_L})_{a_l,1}|\sigma_{l+1},\ldots,\sigma_L\rangle]\\

&= \sum_{a_l}|a_l\rangle_A|a_l\rangle_B

\end{align}
$$
经过简单的计算，我们会发现$|a_l\rangle_A$构成了一组A的标准正交基，但对B系统而言$|a_l\rangle_B$并不能做到。

MPS态的图形化表示见原论文图五，竖线表明指标$\sigma_1,\ldots,\sigma_L$，横线表明收缩(contract)的哑指标$a_1,\ldots,a_{L-1}$。

### QR分解与MPS

显然，对$c_{\sigma_1,\ldots,\sigma_L}$我们也可以做类似的QR分解。与SVD分解类似的步骤，我们能得到：
$$
c_{\sigma_1,\ldots,\sigma_L}=\sum_{a_1}A_{1,a_1}^{\sigma_1}\Psi_{a_1,\sigma_2,\ldots,\sigma_L}=\sum_{a_1,a_2}A_{1,a_1}^{\sigma_1}A_{a_1,a_2}^{\sigma_2}\Psi_{a_1,a_2,\sigma_3,\ldots,\sigma_L}=\cdots
$$
需要注意的是，我们对右半部分可以做*thin QR decomposition*，从而我们可以得到与SVD分解类似的维数上限。如果实际操作中QR分解是可行的，那么在求解速度上它会优于SVD分解；这将以不能得到奇异值谱为代价，如果我们不使用更为升级的**rank-revealing QR decomposition**，我们也不能像SVD分解一样得到相关的秩。

### 左？右？

或许你已经注意到，我们在前面总是强调left，left。一切都是从左开始，显然这并不是必须的要求：我们也可以从右边进行计算，从而得到*right-canonical matrix product state*:
$$
c_{\sigma_1,\cdots\sigma_L}=\sum_{a_{L-1}}U_{\sigma_1,\cdots,\sigma_{L-1}}S_{a_{L-1},a_{L-1}}(V^{\dagger})_{a_{L-1},{\sigma_L}}=\sum_{a_{L-1}}c_{\sigma_1,\cdots\sigma_{L-1}}B_{a_{L-1}}^{\sigma_L}=\cdots
$$
最终我们将得到:
$$
|\psi\rangle = \sum_{\sigma_1,\cdots\sigma_L}B^{\sigma_1}B^{\sigma_2}\cdots B^{\sigma_L}
$$
由V矩阵的性质，我们有*right-normalized*条件：
$$
\sum_{\sigma_l}B^{\sigma_l}B^{\sigma_l\dagger} = I
$$
此时，我们可以将格点系统分为AB部分，写下B系统满足正交归一条件的$|\psi \rangle$MPS态：
$$
\begin{align}

|\psi\rangle &= \sum_{a_l}[\sum_{\sigma_1,\ldots,\sigma_l}(B^{\sigma_1}\cdots B^{\sigma_l})_{1,a_l}|\sigma_1,\ldots,\sigma_l\rangle][\sum_{\sigma_{l+1},\ldots,\sigma_L}(B^{\sigma_{l+1}}\cdots B^{\sigma_L})_{a_l,1}|\sigma_{l+1},\ldots,\sigma_L\rangle]\\

&= \sum_{a_l}|a_l\rangle_A|a_l\rangle_B

\end{align}
$$
我们再用QR分解从右边来一遍，注意：如果$\Psi = QR$，那么$\Psi^\dagger = R^\dagger Q^\dagger$。这里就不再赘述了。
