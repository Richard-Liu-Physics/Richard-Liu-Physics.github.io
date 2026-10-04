---
title: Note on Lieb-Robinson Bound(1)
date: 2023-05-29 00:50:32
tags: ['物理笔记','物理']
categories: 物理笔记
---

This note mainly focus on the basis of Lieb-Robinson Bound, considering the application towards correlation function, topological order, and nonrelativistic Goldstone theorem. The main references are:

[1] [An Online Chinese Note](https://zhuanlan.zhihu.com/p/266233990)

[2] [M. B. Hastings, Locality in Quantum Systems.](https://arxiv.org/pdf/1008.5137.pdf)

<!--more-->

## Part. 1 Lieb-Robinson Bound

Consider $H=\sum_ZH_Z$, where $Z$ is denoted as a set of lattice site and $\| H_Z\|$ decays exponentially.

---

**Theorem 1**

Suppose for site i, we have:
$$
\sum_{X\ni i}\|H_X\||X|\exp[\mu {\rm diam}(X)]\leq s< \infty, ~~~\mu,s>0
$$
Let $A,B$ to be bosonic operators supported on sets $X,Y$(${\rm dist}(X,Y)>0$), then:
$$
\begin{aligned}
\|[A(t),B]\|&\leq 2\|A\|\|B\|\sum_{i\in X}\exp[-\mu{\rm dist}(i,Y)](e^{2s|t|}-1)\\
&\leq 2\|A\|\|B\||X|\exp[-\mu{\rm dist}(X,Y)](e^{2s|t|}-1)\\
\end{aligned}
$$

---

**Proof:**

Let $t_n=\frac{t}{N}n=n\epsilon$, with N is large, and $I_X = \sum_{Z:Z \cap X \neq\varnothing}H_Z$.
$$
\|[A(t),B]\|-\|[A(0),B]\|= \sum_{n=0}^{N-1}\epsilon\frac{\|[A(t_{{n+1}}),B]\|-\|[A(t_n),B]\|}{\epsilon}
$$

$$
\begin{aligned}
\|[A(t_{{n+1}}),B]\|-\|[A(t_n),B]\| &= \|[A(\epsilon),B(-t_n)]\|-\|[A,B(-t_n)]\|\\
&\leq\|[A+i\epsilon[H,A],B(-t_n)]\|-\|[A,B(-t_n)]\|+\mathcal{O}(\epsilon^2)\\
&=\|[A+i\epsilon[I_X,A],B(-t_n)]\|-\|[A,B(-t_n)]\|+\mathcal{O}(\epsilon^2)\\
\end{aligned}
$$

$$
\begin{aligned}
\|[A+i\epsilon[I_X,A],B(-t_n)]\|&=\|[e^{i\epsilon I_X}Ae^{-i\epsilon I_X},B(-t_n)]\|+\mathcal{O}(\epsilon^2)\\
&=\|[A,e^{-i\epsilon I_X}B(-t_n)e^{i\epsilon I_X}]\|+\mathcal{O}(\epsilon^2)\\
&\leq\|[A,B(-t_n)]\|+\epsilon\|[A,[I_X,B(-t_n)]]\|+\mathcal{O}(\epsilon^2)\\
\end{aligned}
$$

Then we obtain:
$$
\begin{aligned}
\|[A(t),B]\|-\|[A(0),B]\|&=2\|A\| \sum_{n=0}^{N-1}\epsilon\sum_{Z:Z \cap X \neq\varnothing}\|[H_Z,B(-t_n)]\|+\mathcal{O}(\epsilon)\\
&=2\|A\| \sum_{n=0}^{N-1}\sum_{Z:Z \cap X \neq\varnothing}\epsilon\|[H_Z(t_n),B]\|+\mathcal{O}(\epsilon)\\
&=2\|A\|\sum_{Z:Z \cap X \neq\varnothing}\int_0^{|t|}dx\|[H_Z(x),B]\|\\
\end{aligned}
$$
*Approximation:* using the upper limit to control the bound.

Define $C_B(X,t):=\sup_{A\in\mathcal{A}_X}\frac{\|[A(t),B]\|}{\|A\|}$, then we have $C_B(X,0)=0$ for${\rm dist}(X,Y)>0$ and :$C_B(Z,0)\leq2\|B\|$
$$
\begin{aligned}
C_B(X,t)&\leq2\|H_Z\|\sum_{Z:Z \cap X \neq\varnothing}\int_0^{|t|}dxC_B(Z,x)\\
&\leq2\|H_{Z_1}\|\sum_{Z_1:Z_1 \cap X \neq\varnothing}\int_0^{|t|}dxC_B(Z,0)\\
&+2^2\|H_{Z_1}\|\|H_{Z_2}\|\sum_{Z_1:Z_1 \cap X \neq\varnothing}\sum_{Z_2:Z_2 \cap Z_1 \neq\varnothing}\int_0^{|t|}\int_0^{|x|}dxdyC_B(Z,y)\\
&\leq2(2|t|)\|B\|\sum_{Z_1:Z_1 \cap X \neq\varnothing,Z_1\cap Y\neq\varnothing}\|H_{Z_1}\|+2\frac{(2|t|)^2}{2!}\|B\|\sum_{Z_1:Z_1 \cap X \neq\varnothing}\sum_{Z_2:Z_2 \cap Z_1 \neq\varnothing,Z_2\cap Y\neq\varnothing}\|H_{Z_1}\|\|H_{Z_2}\|+\cdots
\end{aligned}
$$
For the first term, we have:
$$
\sum_{Z_1:Z_1 \cap X \neq\varnothing,Z_1\cap Y\neq\varnothing}\|H_{Z_1}\|\leq\sum_{i\in X}\sum_{Z_1\ni i,Z_1\cap Y\neq\varnothing}\|H_{Z_1}\|
$$
In case that $Z_1\cap Y\neq\varnothing$, then ${\rm dist}(i,Y)\leq {\rm diam}(Z)$, which means:
$$
\sum_{Z_1:Z_1 \cap X \neq\varnothing,Z_1\cap Y\neq\varnothing}\|H_{Z_1}\|\leq \sum_{i\in X}\exp(-\mu{\rm dist}(i,Y))
$$
For the second term, we have:
$$
\begin{aligned}
&\sum_{Z_1:Z_1 \cap X \neq\varnothing}\sum_{Z_2:Z_2 \cap Z_1 \neq\varnothing,Z_2\cap Y\neq\varnothing}\|H_{Z_1}\|\|H_{Z_2}\|\\
&=\sum_{i\in X}\sum_{Z_1 \ni i}\sum_{j\in Z_1}\sum_{Z_2\ni j,Z_2\cap Y\neq \varnothing}\|H_{Z_1}\|\|H_{Z_2}\|\\
&\leq\sum_{i\in X}\sum_{Z_1 \ni i}\sum_{j\in Z_1}\sum_{Z_2\ni j,Z_2\cap Y\neq \varnothing}\|H_{Z_1}\|\|H_{Z_2}\|\exp(-{\rm dist}(i,Y))\exp({\rm dist}(i,j))\exp({\rm dist}(j,Y))\\
&= \sum_{i\in X}\sum_{Z_1 \ni i}\sum_{j\in Z_1}\exp(-{\mu\rm dist}(i,Y))\exp(\mu{\rm dist}(i,j))\sum_{Z_2\ni j,Z_2\cap Y\neq \varnothing}\|H_{Z_1}\|\|H_{Z_2}\|\exp(\mu{\rm dist}(j,Y))\\
&\leq \sum_{i\in X}\sum_{Z_1 \ni i}\sum_{j\in Z_1}\exp(-\mu{\rm dist}(i,Y))\exp(\mu{\rm dist}(i,j))\sum_{Z_2\ni j,Z_2\cap Y\neq \varnothing}\|H_{Z_1}\|\|H_{Z_2}\|\exp(\mu{\rm diam}(Z_2))\\
&\leq \sum_{i\in X}\sum_{Z_1 \ni i}\sum_{j\in Z_1}\exp(-\mu{\rm dist}(i,Y))\exp(\mu{\rm dist}(i,j))\|H_{Z_1}\|s\\
&\leq \sum_{i\in X}\sum_{Z_1 \ni i}\exp(-\mu{\rm dist}(i,Y))\exp(\mu{\rm diam}(Z_1))\|H_{Z_1}\|s|Z_1|\\
&\leq \sum_{i\in X}\exp(-\mu{\rm dist}(i,Y))s^2\\
\end{aligned}
$$
Higher order terms follows the same procedure. Then,
$$
C_B(X,t)\leq2\|B\|\sum_{i \in X}\exp[-\mu{\rm dist}(X,Y)](e^{2s|t|}-1)
$$
Q.E.D.

---

We now have Lieb-Robinson bound with the form:
$$
\|[A(t),B]\|\leq 2\|A\|\|B\||X|\exp[-\mu{\rm dist}(X,Y)](e^{2s|t|}-1)\\
$$
We can then deduce another form setting a constant $v_{LR}$ such that for $t\leq {\rm dist}(X,Y)/v_{LR}$,
$$
\|[A(t),B]\|\leq \frac{v_{LR}t}{l}\|A\|\|B\||X|g(l),l={\rm dist}(X,Y)
$$
Apparently, $v_{LR}=4s/\mu$ is a plausible choice.
