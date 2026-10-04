---
title: Notes on Fermionic Systems
date: 2022-04-29 14:54:42
tags: ['物理笔记','物理']
categories: 物理笔记
---

This is the note of my summer research after my junior year，the reference is the note of HH Tu,TENSOR NETWORKS (SS2021)  Lecture 10&11。

<!--more-->

{% meting "497572729" "netease" "song" %}

## Correlation matrix

For free fermionic system, providing $T_{ij}$ is symmetric, the generic Hamiltonian is:
$$
H = \sum_{j,l=1}^{N}c_j^{\dagger}T_{jl}c_l
$$
Diagonalizing $T_{ij}$ will give the operator $d_m^\dagger,d_m$,which is the creator/annihilator according to the energy of the mode:
$$
H= \sum_{j,l=1}^{N}c_j^{\dagger}T_{jl}c_l =\sum_{m=1}^{N}\varepsilon_md_m^\dagger d_m
$$

Selecting the negative energy mode which number is M gives the ground state:
$$
|\psi \rangle = \prod_{m=1}^{M}d_m^\dagger |0 \rangle
$$
Define the correlation matrix (correlation function in matrix form):
$$
G_{lj} = \langle\psi|c_j^\dagger c_l|\psi\rangle
$$
It has the property that the energy mode creators and annihilators diagonal the correlation matrix as follows:
$$
\begin{align}
\begin{aligned}
(UGU^\dagger)_{m'm} &= \sum_{j,l=1}^{N}U_{m'l}\langle\psi|c_j^\dagger c_l|\psi\rangle U^\dagger _{jm}\\
&=\langle\psi|d_m^\dagger d_{m'}|\psi\rangle
\end{aligned}
\end{align}
$$
For general pure state, the single-particle basis which diagonalizes 𝐺 defines *natural orbitals*, which means even though the pure state is not the ground state, then there is possible that some modes(orbitals) may be not occupied.

## Calculating the reduced density matrix

As mentioned above, for free fermions, the correlation matrix can be shown as:
$$
\begin{align}
G_{lj}^A &= \langle\psi|c_j^\dagger c_l|\psi\rangle\\
& = tr|\psi\rangle\langle\psi|c_j^\dagger c_l\\
& = tr_A{}tr_B \rho c_j^\dagger c_l \\
& = tr_A(\rho_Ac_j^\dagger c_l)
\end{align}
$$
If we diagonal the $G^A$ , we have:
$$
G^A_{lj}= \sum_{p=1}^{N_A}V_{lp}^\dagger \Lambda_pV_{pj},\Lambda_p \in [0,1]\\
\Lambda_p\delta_{pp'} = \sum_{j,l = 1}^{N_A}V_{pl}G^A_{lj}V^\dagger_{jp'}= \sum_{j,l = 1}^{N_A}V_{pl}tr_A(\rho_Ac_j^\dagger c_l)V^\dagger_{jp'} = tr_A(\rho_Af^\dagger_{p'}f_p)
$$
Meanwhile, if $p\not= p'$, then $tr_A(\rho_Af^\dagger_{p'}f_p) = 0$. What should be said is that here we defined a new set of creators and annihilators. From above, we have:
$$
\Lambda_p = tr_A(\rho_Af^\dagger_{p}f_p)\\
1-\Lambda_p = tr_A(\rho_Af_pf^\dagger_{p})
$$
From a clever perspective, we have:
$$
\rho_A = \prod_{p=1}^{N_A}[\Lambda_pf^\dagger_{p}f_p+(1-\Lambda_p )f_pf^\dagger_{p}]
$$
This expression means that for free fermion system, the reduced density matrix can be writen as some direct products of two level system.

If we generate state vectors using $f^\dagger$, which means$|\alpha \rangle =|n_1,n_2,\ldots,n_{N_A}\rangle$, then:
$$
\rho_A|\alpha\rangle = \prod_{p=1}^{N_A}[\Lambda_pn_p+(1-\Lambda_p )(1-n_p)]|\alpha\rangle
$$
In other words, $|\alpha \rangle$ is the eigenvector of the reduced density matrix. Here, we define the entanglement spectrum as the eigenvalues of $-\ln\rho_A$, and the entanglement Hamiltonian as $\rho_A = e^{-H}$.

Because of the special property of anticommutation of fermion operator we can know that:
$$
\rho_A \propto \exp[-\sum_{p=1}^{N_A}-\ln(\frac{\Lambda_p}{1-\Lambda_p})f_p^\dagger f_p]=\exp(-\sum_{p=1}^{N_A}\tilde\varepsilon_p f_p^\dagger f_p)
$$
which means zero mode indicates degeneracy in entanglement spectrum.

As equation (1) shown that free  fermion state created by $f^\dagger $​ is the eigenvector of the reduced density matrix, (NOTICE: the state is not necessarily to be the ground state) so The Schmidt decomposition can be computed exactly for free fermion systems.

If you want to calculate the entanglement entropy of the system, you can  do it via what is said above. You can also  compute the central charge of the system via entanglement entropy. (**Maybe I should calculate one here.**)

## MPS for free fermion state

For MPS approximation, there is two way of doing truncation for free fermion systems. The first is Gaussian truncation, and the second is SVD truncation. The former keeps the nature of Gaussian state, in other words, stay to be the free fermion states. **This can be seen in the paper: M. T. Fishman & S. R. White, Phys. Rev. B 92, 075132 (2015).**

As equation (1) shown that free  fermion state created by $f^\dagger $ is the eigenvector of the reduced density matrix, (NOTICE: the state is not necessarily to be the ground state) so The Schmidt decomposition can be computed exactly for free fermion systems.

So to write a free fermion state into MPS form require bipartitions steps, below is one example:

![](1.png)

Any state $|\alpha \rangle $ can be written as a combination of $|\beta \rangle \bigotimes |n \rangle $:
$$
|\alpha \rangle =\sum_{\beta, n}A_{\beta\alpha}^{n} |\beta \rangle \bigotimes |n \rangle
$$
what should be claimed here is that $A_{\beta\alpha}^n$ is in a block diagonal form. Now we compute the coefficients using the results gained from correlation matrix and assuming $n=0$:
$$
\begin{align}
|\alpha \rangle &= f_1^\dagger \cdots f_m^\dagger |0 \rangle_{1\rightarrow i}
=\prod_{p=1}^{m}\sum^i_{j=1}c_j^\dagger V_{jp}^\dagger |0 \rangle_{1\rightarrow i}=\prod_{p=1}^{m}\sum^i_{j=1}c_j^\dagger V_{jp}^\dagger |0 \rangle_{1\rightarrow i-1}\bigotimes |0 \rangle_i\\
|\beta \rangle &= \tilde f_1^\dagger \cdots \tilde f_m^\dagger |0 \rangle_{1\rightarrow i-1}=\prod_{p=1}^{m}\sum^{i-1}_{j=1}c_j^\dagger V{'}_{jp}^\dagger |0 \rangle_{1\rightarrow i-1}=\prod_{p=1}^{m}\sum^{i}_{j=1}c_j^\dagger \tilde V_{jp}^\dagger |0 \rangle_{1\rightarrow i-1}
\end{align}
$$
Remember in mind, $\tilde V^\dagger$ is irreversible. As the set of $|\beta \rangle \bigotimes |n \rangle$ forms the Schmidt vectors, we have:
$$
A^0_{\beta\alpha} = (\langle 0|\bigotimes\langle\beta|)|\alpha \rangle = \langle 0|\prod_{p=m}^{1}\sum^{i}_{j=1}c_j \tilde V_{jp}\prod_{p'=1}^{m}\sum^i_{j'=1}c_{j'}^\dagger V_{j'p'}^\dagger |0\rangle
$$
**(Personal statement)**Similarly, we can compute $A_{\beta\alpha}^{1}$, which requires different meaning of $\tilde V^\dagger$. Noticing the order of creators:
$$
|\beta \rangle \bigotimes |1 \rangle = \tilde f_1^\dagger \cdots \tilde f_{m-1}^\dagger c_i^\dagger|0 \rangle_{1\rightarrow i-1}\bigotimes |0 \rangle_i =\prod_{p=1}^{m}\sum^i_{j=1}c_j^\dagger \tilde V_{jp}^\dagger |0 \rangle_{1\rightarrow i}
$$
The following procedure ends up with the same answer. In this way we can write down the MPS form of free fermion state.

## Convert a Fermion sea into MPS state

According to the creators and annihilators for different eigenstates of energy modes, these operators is just a combination of that according to sites:
$$
\begin{align}
d_m^\dagger &= \sum_{l=1}^{N}A_{ml}c^\dagger_l\\
& = 
\begin{pmatrix}
0	&1
\end{pmatrix}
\begin{pmatrix}
1	&0\\
A_{m1}c_1^\dagger &1\\
\end{pmatrix}
\begin{pmatrix}
1	&0\\
A_{m2}c_2^\dagger &1\\
\end{pmatrix}
\cdots
\begin{pmatrix}
1	&0\\
A_{mN}c_N^\dagger &1\\
\end{pmatrix}
\begin{pmatrix}
1\\
0\\
\end{pmatrix}
\end{align}
$$
What should be noticed is that matrix $A$ and matrix $U$ is not the same, i.e. $A = (U^\dagger)^T = U^*$ . Here we use use Jordan-Wigner transformation to introduce a correspondence between fermion creators and spin operators:
$$
c_l^\dagger = (-\sigma_1^z)\cdots(-\sigma_{l-1}^z)\sigma_l^+
$$
In that case, we have:
$$
d_m^\dagger =
\begin{pmatrix}
0	&1
\end{pmatrix}
\begin{pmatrix}
1	&0\\
A_{m1}\sigma_1^+ &-\sigma_1^z\\
\end{pmatrix}
\begin{pmatrix}
1	&0\\
A_{m2}\sigma_2^+ &-\sigma_2^z\\
\end{pmatrix}
\cdots
\begin{pmatrix}
1	&0\\
A_{mN}\sigma_N^+ &-\sigma_N^z\\
\end{pmatrix}
\begin{pmatrix}
1\\
0\\
\end{pmatrix}
$$
So here we have successfully written the creator as a MPO. Graphically, that is as follows.

![](2.png)

The different quantities for different indexes is as follows: ![](3.png)

In a nutshell, the Fermi sea can be written in a sequence of MPO. As a consequence, the bond dimension will increase exponentially. So at some point truncation is needed. High fidelity compression requires low-entanglement “intermediate” states (This statement can be seen as the result of Jensen Inequality).

## Truncation procedure for MPO-MPS evolution

### SVD truncation for a given MPS

The truncation is a process described as follows graphically :

![](4.png)

To understand what I'm doing here, you may consult the previous article.

{% post_link From-Matrix-Prodoct-State-MPS-to-DMRG From Matrix Product State(MPS) to DMRG（1） %}

What should be stressed here is the process of QR decomposition: as we want to use SVD decomposition to maximize the approximation, we should put the MPS state in the canonical form, i.e. the state should consisted of Schmidt vectors for different blocks.

If you are not satisfied with the accuracy of SVD truncation, you may use DMRG to "sweep" to get a better result.

### Different type of oporators

As we mentioned above, in the process of applying the MPOs, we need *low-entanglement “intermediate” states*. For $d_m^\dagger$, it usually create the non-local particle mode. You can easily check the 1D chain of tight binding model to verify the statement.

Here we want to deduce more local creators using the negative energy mode, which can't be the the initial $c_i^\dagger$ for there exist positive energy mode. We use the position operator $X = \sum_llc_l^\dagger c_l$, i.e. $X$ can give the expectation value of state's position.

Construct the matrix $\tilde X_{nm} = \langle 0|d_m^\dagger d_{m'}|0\rangle$ and diagonal the matrix, we get a spectrum of position operator and a unitary matrix $U$. Then we can construct $f_r^\dagger$:
$$
U\tilde X U^\dagger = diag(x_1,\ldots,x_M)\\
f_r^\dagger = \sum_{l=1}^MU_{rl}d^\dagger_l = \sum_{l=1}^N(UA)_{rl}c^\dagger_l
$$
**Q: Why this represent Wannier orbitals?**

![](5.png)

From what is shown in the Proof picture, we know that we can use the new operators to get a state created by the old ones up to a trivial phase factor. As a trick to suppress entanglement growth, we may use "left meet right" way instead of creating from left to right.

## Time evolution in MPO-MPS form

When we discuss evolution of states, we may translate that process into MPS-MPS form. Especially for imaginary-time evolution, which is heading towards th ground state of the system.

For lattice model,  we may separate different part of Hamiltonian and manipulate the MPO in a sequence. For the separated parts commute with each other, we just do two steps of MPO. Notice: Here SVD(QR) decomposition is some what used.

![](6.png)

For non-commuting case, we just divide the time evolution into small steps, just as what we do in deducing the path integral formula. This will require a long sequence of MPO.
