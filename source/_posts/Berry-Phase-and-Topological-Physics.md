---
title: Berry Phase and Topological Physics
date: 2025-01-13 23:25:58
tags: ['物理笔记','物理']
categories: 物理笔记
---

本篇主要内容参考*Topological insulators and topological superconductors / B. Andrei Bernevig*，夹带些许私货。<!--more-->

考虑基态无简并的含参哈密顿量$H(x^a;\lambda^i)$，其中$\lambda^i$是决定该哈密顿量的参数，而$x^a$是系统本身的自由度。当给定$\lambda^i$时，我们能给出该哈密顿量的特征向量和特征值，特别的，我们可以知道该哈密顿量的基态$|n(\lambda^i)\rangle$。因此我们可以将$\lambda^i$视为量子态$|n(\lambda^i)\rangle$的参数坐标，这些参数可以确定这些量子态，这些量子态本身的集合可以构成一个流形$\mathcal{E}$（当然这里需要一些对哈密顿量有一些光滑性条件的约束，但是作为物理学家我们总是假设这些都是自动成立的:D）。

*(Some math)敏锐的读者可能已经发现，“知道基态”这个说法其实并不严格，因为我们对于量子态的相位其实是未知的。这导致基态也可以取$|n'(\lambda^i)\rangle := e^{i\theta(\lambda^i)}|n(\lambda^i)\rangle$。也就是说，实际上完全确定的是量子态的密度矩阵$|n(\lambda^i)\rangle\langle n(\lambda^i)|$。我们将这些密度矩阵给出的流形称为$\mathcal{M}$。自然的，从流形$\mathcal{E}$到流形$\mathcal{M}$有一个自然的映射$\phi: |n(\lambda^i)\rangle \rightarrow|n(\lambda^i)\rangle\langle n(\lambda^i)|$，因为对应同一个密度矩阵的量子态可以相差一个相位，那么这里$(\mathcal{E},\mathcal{M},U(1),\phi)$自然的给出了一个纤维丛的结构。*

我们考虑$\lambda^i$是关于时间的单参函数，且$\lambda^i(t)$随时间缓慢变化极其缓慢。绝热定理告诉我们，如果我们从这个哈密顿量的基态出发，该哈密顿量给出的时间演化将使得任意时刻的量子态$|\psi(t)\rangle$始终处于该时刻的基态。此时，我们对该量子态未知的自由度将仅仅来自于global phase，也就是说$|\psi(t)\rangle =e^{-i \theta(t)} |n(\lambda^i)\rangle$。自然的我们会问：这一相位的存在重要吗？可以将$|\psi(t)\rangle$记作$|\psi(\lambda^i (t))\rangle$从而得到不显含时间的量子态吗？在量子力学课上，我们常说"Global phase doesn't matter"，但是在接下来的推导中我们会发现在时间演化过程中，这一相位会起到至关重要的作用。我们注意到，对$|\psi(t)\rangle$，薛定谔方程将形如
$$
E_n(\lambda^i(t))|n(\lambda^i(t))\rangle = d_t\theta(t)|n(\lambda^i(t))\rangle + id_t|n(\lambda^i(t))\rangle.
$$
如果我们将上述方程两边与$\langle n(\lambda^i(t))|$取内积并积分，我们会得到
$$
\theta(t) = \int E_n(\lambda^i(t))dt - i \int \langle n(\lambda^i(t))|d_t|n(\lambda^i(t))\rangle dt.
$$
这里的第一项与路径有关，被称为dynamical phase。而对于第二项我们注意到：
$$
\int dt \langle n(\lambda^i(t))|d_t|n(\lambda^i(t))\rangle =\int dt \langle n(\lambda^i(t))|\frac{d\lambda^j}{dt}\frac{\partial}{\partial \lambda^j}|n(\lambda^i(t))\rangle = \int_C \langle n|\frac{\partial}{\partial \lambda^j}|n\rangle d\lambda^j
$$
我们定义贝里联络$\mathcal{A}_i(\lambda) =i\langle n|\frac{\partial}{\partial \lambda^i}| n\rangle$，从而我们可以得到：
$$
\theta(t) = \int E_n(\lambda^i(t))dt -\int_c \mathcal{A}_i(\lambda)\cdot d\lambda^i
$$
我们发现上式中的第二项单纯依赖于参数空间的路径并不含时，我们将这一项的贡献称为贝里相位(Berry phase)。这一贡献本身来自于希尔伯特空间的几何效应，在闭合路径下其对应着动力学下从流形$\mathcal{M}$ horizontal lift到流形$\mathcal{E}$时给出的holonomy，详见*Derivation of the geometrical phase, Bohm, Arno et. al.*。

从贝里联络的形式中我们容易看出，由于基态波函数全局相位的选取并不是唯一的，一个新的全局相位选择会直接改变贝里联络。如果我们对$|n(\lambda^i(t))\rangle$取一个新的规范 i.e. $|n'(\lambda^i(t))\rangle:=e^{i\omega(\lambda^i)}|n(\lambda^i(t))\rangle$，我们会看到
$$
\mathcal{A}'_i(\lambda) =i\langle n'|\frac{\partial}{\partial \lambda^i}| n'\rangle = i\langle n|\frac{\partial}{\partial \lambda^i}| n\rangle -\partial_i\omega,
$$
因此
$$
\theta'(t) = \int E_n(\lambda^i(t))dt -\int_c \mathcal{A}_i(\lambda) d\lambda^i+\int_c d\omega
$$
如果我们要求参数空间的路径是闭合路径时，由于$\int_c d\omega = 0$，我们会看到即使选择了不同规范，相位的改变也将是相同的。之后我们会看到，这一结果将直接导致陈数的计算结果是量子化的。在此之后，我们忽略dynamical phase给出的贡献，即只考虑Berry phase $\beta := \int_c \mathcal{A}_i(\lambda)d\lambda^i =i\int_C \langle n(\lambda^i(t))|\frac{\partial}{\partial \lambda^j}|n(\lambda^i(t))\rangle d\lambda^j$.当路径为闭合路径时，根据斯托克斯公式我们有
$$
\beta = i\int_S d\left(\langle n|\frac{\partial}{\partial \lambda^j}|n\rangle d\lambda^j\right) = i\int_S d\lambda^k\wedge d\lambda^j\frac{\partial}{\partial \lambda^k}\left(\langle n|\frac{\partial}{\partial \lambda^j}|n\rangle d\lambda^j\right) = i \int_S d\lambda^k\wedge d\lambda^j\left(\frac{\partial}{\partial \lambda^k}\langle n|\right)\left(\frac{\partial}{\partial \lambda^j}|n\rangle\right),
$$
显然我们可以得到一个等价的表示（真的很显然）：
$$
\beta =1/2 \int_S d\lambda^k\wedge d\lambda^j \Omega_{kj},
$$
这里$\Omega_{kj}$指贝里联络的曲率（由贝里联络导出的二阶反对称张量）：
$$
\Omega_{kj} = i \left(\frac{\partial}{\partial \lambda^k}\langle n|\right)\left(\frac{\partial}{\partial \lambda^j}|n\rangle\right) - (k\leftrightarrow j) = \frac{\partial}{\partial \lambda^k}\mathcal{A}_j(\lambda)-\frac{\partial}{\partial \lambda^j}\mathcal{A}_k(\lambda)
$$
当参数空间为3维时，我们可以证明
$$
\beta = i\int_S d\vec S\cdot\langle\nabla n|\times|\nabla n\rangle = i \int_S dS_i \varepsilon_{ijk}\langle\nabla_j n| \nabla_k| n\rangle
$$
在继续讨论之前，我们注意到上述计算中并没有用到我们演化的量子态是基态的性质，换句话说，只要我们考虑的量子态是本征态且能隙不闭合，我们就能利用绝热定理进行同样的计算。同时我们容易证明$\langle n| \nabla_k| n\rangle$是纯虚数，所以贝里相位中所有的虚数$i$都可以用$-{\rm Im}$来替代。接下来我们假设我们的哈密顿量的能带始终不闭合且第$n$个本征态我们用$|n\rangle$表示。我们注意到
$$
\langle\nabla_j n| \nabla_k| n\rangle =\langle\nabla_j n|\sum_m|m\rangle\langle m| \nabla_k| n\rangle = \langle\nabla_j n|\sum_{m\neq n}|m\rangle\langle m| \nabla_k| n\rangle +\langle\nabla_j n|n\rangle\langle n| \nabla_k| n\rangle
$$
由于上式的第二项为纯虚数乘以纯虚数，所以
$$
{\rm Im}\langle\nabla_j n| \nabla_k| n\rangle ={\rm Im}\sum_{m\neq n}\langle\nabla_j n|m\rangle\langle m| \nabla_k| n\rangle
$$
我们注意到
$$
E_n\langle m| \nabla_i| n\rangle = \langle m|\nabla_i(H|n\rangle) = \langle m|\nabla_iH|n\rangle+E_m\langle m| \nabla_i| n\rangle
$$
因此
$$
{\rm Im}\langle\nabla_j n| \nabla_k| n\rangle = {\rm Im}\sum_{m\neq n}\frac{\langle n|\nabla_jH|m\rangle\langle m|\nabla_kH|n\rangle}{(E_m-E_n)^2}
$$

$$
\beta_n = -{\rm Im} \int_S dS_i \varepsilon_{ijk}\sum_{m\neq n}\frac{\langle n|\nabla_jH|m\rangle\langle m|\nabla_kH|n\rangle}{(E_m-E_n)^2}
$$

上述公式由于将求偏导数的操作转移到了哈密顿量上，能避免由于数值计算贝里曲率时本征态规范选取不受控制的情况，因而具有较高的稳定性。同时我们容易看出$\sum_n\beta_n = 0$。上述公式在参数维度不同于3维时可以由(7)式得到推广形式，在此不做阐述。

针对(17)式，我们考虑二能级系统。不失一般性，我们假设哈密顿量为$H(\lambda^i) = \vec d(\lambda^i)\cdot\vec\sigma$，此时的本征态的密度矩阵为$\rho_\pm = \frac{1\pm\hat d(\lambda^i)\cdot\vec\sigma}{2}$其中$\hat d$为$\vec d$的归一化矢量，且$E_+-E_- = 2|\vec d|$。我们有
$$
\langle +|\nabla_jH|-\rangle\langle -|\nabla_kH|+\rangle = {\rm Tr}\left[\frac{1+\hat d\cdot\vec\sigma}{2}(\nabla_j \vec d)\cdot\vec \sigma \frac{1-\hat d\cdot\vec\sigma}{2}(\nabla_k \vec d)\cdot\vec \sigma\right ]
$$
由于(17)式中只存在虚部的贡献，我们可以得到
$$
\begin{align}
{\rm Im}\langle +|\nabla_jH|-\rangle\langle -|\nabla_kH|+\rangle &={\rm Im} \frac{1}{4}{\rm Tr}\left[-(\nabla_j \vec d)\cdot\vec \sigma\ \hat d\cdot\vec\sigma\ (\nabla_k \vec d)\cdot\vec \sigma+\hat d\cdot\vec\sigma\ (\nabla_j \vec d)\cdot\vec \sigma\ (\nabla_k \vec d)\cdot\vec \sigma\right]\\
&={\rm Im}\frac{1}{4}{\rm Tr}\left[\hat d\cdot\vec\sigma\ [(\nabla_j \vec d)\cdot\vec \sigma,(\nabla_k \vec d)\cdot\vec \sigma]\right]\\
&={\rm Im}\frac{i}{2}{\rm Tr}\left[\hat d\cdot\vec\sigma\ (\nabla_j \vec d)\times(\nabla_k \vec d)\cdot\vec \sigma\right]\\
&=\hat d\cdot (\nabla_j \vec d)\times(\nabla_k \vec d)\\
&=|\vec d|^2\hat d\cdot (\nabla_j \hat d)\times(\nabla_k \hat d)
\end{align}
$$
带回(17)式中我们得到
$$
\beta_+ = -\frac{1}{4}\int_SdS_i\varepsilon_{ijk}\hat d\cdot (\nabla_j \hat d)\times(\nabla_k \hat d)\\
\beta_- = \frac{1}{4}\int_SdS_i\varepsilon_{ijk}\hat d\cdot (\nabla_j \hat d)\times(\nabla_k \hat d)
$$
很显然，此时的贝里相位表达式和所谓的Skymion picture的形式便吻合上了。
