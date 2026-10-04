---
title: Notes on strong correlated system(1)
date: 2022-08-17 09:42:23
tags: ['物理笔记','物理']
categories: 物理笔记
---

This is a note for the reading of the 2nd yellow book by *Nagaosa*.

<!--more-->

# Bosonization

The example we will discuss is one of the so-called Tomonaga-Luttinger liquids, XXZ model.

For XXZ model, the Halmiltonian is:
$$
H = J_\perp\sum_i(S^x_iS^x_{i+1}+S^y_iS^y_{i+1})+J_z\sum_iS_i^zS_{i+1}^z=\frac{J_\perp}{2}\sum_i(S^+_iS^-_{i+1}+S^-_iS^+_{i+1})+J_z\sum_iS_i^zS_{i+1}^z
$$


For the discrete case, we have the Hamiltonian (Using the technique of Jordan-Wigner Transformation):
$$
H = -\frac{J_\perp}{2}\sum_{i=1}^{N}(f_i^\dagger f_{i+1}+f_{i+1}^\dagger f_i)+J_z\sum_{i=1}^{N}(f_i^\dagger f_i-\frac{1}{2})(f_{i+1}^\dagger f_{i+1}-\frac{1}{2}) = H_1+H_2
$$
If we introduce the Fourier transformation:
$$
f_n = \frac{1}{\sqrt{N} }\sum_kf_ke^{ikn},f_n^\dagger = \frac{1}{\sqrt{N} }\sum_kf_k^\dagger e^{-ikn}
$$
Then we have:
$$
H_1 = \sum_k (-J_\perp \cos k)f_k^\dagger f_k
$$
We treat $J_z$ as perturbation, and in case that $S_{tot}^z = 0$, we have the the ground state of $H_1$ is just the Fermi sea state (just from the fact that $S_i^z = f_i^\dagger f_i-\frac{1}{2}$). We can see immediately that $H_2$ is the particle-hole excitation as we look back at the original Hamiltonian that $H_2$ will not change the z-spin of each site.

From the perspective of perturbation, the low-energy particle-hole exitation near the Fermi surface will be dominant.

## 1st step: Linearization

In case that only the vicinity of the Fermi surface that counts, we replace the dispersion relation $\varepsilon_k = -J_\perp \cos k$ by two linearized dispersion relationship, and also only consider the creation/annihilation of $k_F$ then we have:
$$
f_n =\frac{1}{\sqrt{N} }\sum_kf_ke^{ikn}= R(x_n)e^{ik_Fx_n}+L(x_n)e^{-ik_Fx_n}
$$
**And because $R(x_n),L(x_n)$ contain only the long wavelength components, then we consider it to be continuous.**  We write:
$$
\psi(x) = 
\begin{pmatrix}
R(x)\\
L(x)\\
\end{pmatrix}
$$
Then we have:
$$
H_1 = -J_\perp \int dx \bar{\psi} i \gamma_1\partial_x\psi
$$
**Notes on proof:**
$$
\bar{\psi} i \gamma_1\partial_x\psi = i(R^\dagger\partial_xR-L^\dagger\partial_xL)\\
\begin{aligned}
f_l^\dagger f_{l+1}+f_{l+1}^\dagger f_l &= (R^\dagger_le^{-ik_Fl}+L^\dagger_le^{ik_Fl})(R_{l+1}e^{ik_F(l+1)}+L_{l+1}e^{-ik_F(l+1)})+h.c.\\
& = R^\dagger_le^{ik_F}R_{l+1}+R^\dagger_le^{-ik_F(2l+1)}L_{l+1}+L^\dagger_le^{ik_F(2l+1)}R_{l+1}+L^\dagger_le^{-ik_F}L_{l+1}+h.c.\\
&= iR_l^\dagger R_{l+1}-i(-1)^lR_l^\dagger L_{l+1}+i(-1)^lL^\dagger_lR_{l+1}-iL^\dagger_l L_{l+1}+h.c.\\
&\approx iR_l^\dagger R_{l+1}-iL^\dagger_l L_{l+1}+h.c.\\
\end{aligned}
$$
Performing a Fourier transformation, we have:
$$
R(x) = \frac{1}{2\pi}\int dk e^{ikx}R(k), \partial_xR = \frac{1}{2\pi}\int dk e^{ikx}ikR(k)\\
H_1 = \sum_k J_\perp k(R^\dagger(k)R(k)-L^\dagger(k)L(k))
$$
To compute the $J_z$ term, we need to figure out:
$$
f^\dagger_nf_n = R_n^\dagger R_n+L^\dagger_nL_n+e^{2ik_Fn}(R_n^\dagger L_n+L^\dagger_nR_n)
$$
