---
title: Python面向对象编程
date: 2021-07-28 13:33:02
tags: ['Python 3','CS搬砖教程']
categories: CS搬砖
---

# Python 3 OOP（1）

This is a note in Chinese.

介于之后可能在物理科研过程中的编程面对对象的运算封装，且因为我浅薄无比的Python 3 知识，决心下苦工夫学习这一系列的知识。本文主要是依据*Dusty Phillips*所写的*Python 3面向对象编程*一书所写笔记，希望不会咕咕咕。

<!--more-->

## 一.面向对象设计

**对象**：数据和相关行为的集合。

**面对对象**：通过数据和行为来描述一系列相互作用的对象。在这一概念下，还有小概念：

- 面对对象分析（OOA）：关注需要完成什么；
- 面对对象设计（OOD）：关注如何完成；
- 面对对象编程（OOP）：完成OO程序设计。

类之间的关系可以用*统一建模语言（UML）*来描述，同时UML涵盖内容包括类与对象图、用例、部署、状态变化、活动等。我们可以通过UML刻画类与类之间的交互（类图）；也可以刻画系统在某一时刻的特定状态，以及对象的实例（实例图/对象图 ）。具体实例见书P12。

### a.指定属性和行为

对对象而言：数据通常代表特定对象的个体特征，行为是可以发生在一个对象上的动作。

在面向对象建模过程中，我们用*类*描述对象类型。不同对象可能具有来自同一类的相同属性和行为，而对象是一些可以相互关联的类的实例。

在数据意义上，类可以定义一系列属于这一类对象所有的共同特征（属性），而任意特定对象在这些特征上有不同的特征值。属性（Attribute）也常常被称为特性（property），通常来说前者可赋值后者为只读。但在Python中“只读“概念几乎毫无意义，因此可以视为同义词。

属性类型通常是大部分编程语言中标准的基本类型，例如整数、浮点数、字符串、字节、布尔值；也可能是列表、树、图、甚至是其他类的数据结构。

我们称执行在一类对象上的行为为**方法**。在编程层面上，方法就像是结构化编程中的函数，但是可以**得到与这一对象有关的全部数据，接收一些参数(parameter)并且返回值。**传递给调用对象的对象通常被称为*实参*(argument)。给每个对象添加属性和方法让我们能创一个由交互对象组成的**系统**。

### b.隐藏细节并创建公共接口

在面向对象设计中，设计适当的公共接口是非常重要的。我们不需要对象之间交互全部内部信息，只需要通过这个接口交换信息，在这个过程中，隐藏了对象具体实现或功能细节，即**信息隐藏**或**封装**。从内部细节提取公共接口的过程称为**抽象**。在大型工程中，我们可以调整内部算法使得封装更为高效，但是公共接口的更改会引起很大的变动因而是很难进行的，因此需要多加注意。

#### 小tip：

- 对象通常是名词，方法通常是动词，属性通常是形容词或名词（如果属性是另外一个类）。

- 设计是开放式的，但是只针对必须的内容建模。
- 设计接口时，一般需要有较强的隐私意识。

### c.组合与继承

**组合**与**继承**是两个基本的面向对象原则，组合是将几个对象收集在一起生成新的对象的行为，而继承是描述“是一个”这类关系的原则，一个类可以从另一个类中继承属性和方法。

还有一种与组合类似的概念，当对象可以独立存在时，我们称这种收集在一起的行为为**聚合**。或者说，组合的外部与相关的（内部）对象相对独立，或者内部对象生命周期比组合对象长，我们便最好称为聚合。**所有的组合关系也是聚合关系，反之不一定。**

在继承关系中，我们采取在父类中写入一个并不使用的方法，在子类中用特定的实现来重写它。即**创建一个抽象类同时将方法声明为抽象方法来实现**。实际上，我们可以让一个类不实现任何方法，即声明可以做什么但是完全不告知要如何去做，这种类叫**接口**。

**多态**是根据子类的不同实现而区别对待父类的能力。比如在棋盘中，我们可以“移动”棋子，而“移动”这一方法对不同的棋子有着不相同的实现（帅，象，车……）。Python中的这种多态通常称为**鸭子类型**。

在面向对象编程中，我们允许实现**多重继承**，即子类从多个父类继承他们的功能。但这种做法可能造成混乱，如子类从两个父类继承时得到了一样而实现不同的方法，请尽量避免这种情况发生。

### d.案例学习

见书P16，实在不想画UML……

## 二.Python对象

**主要目的：**

- 如何在Python中创建类和继承对象；
- 如何为Python对象添加属性和行为；
- 如何将类组织成包和模块；
- 如何建议人们不要乱动我们的数据。

### 创建Python类

建议类名采用驼峰格式：以大写字母开头，任意后续单词都以大写字母开头。eg. CamelCase

创建类名	class <类名>：

定义方法	def  <方法名>(参数)：

点标记法(dot notation)为对象赋值	<对象>.<属性>=<值>

所有的方法都需要有一个必要的参数，一般记作self，该参数就是对方法调用对象的引用。除去<对象>.<方法>这一用法，我们还可以明确的写出<类>.<方法>(对象)

```python
class Point:
    def reset(self):
        self.x = 0
        self.y = 0
    
p=Point()
p.reset()
print(p.x,p.y)
```

**小tip：** assert函数是一个简单的测试工具，如果括号内为False（或者0，None，空值）那么程序将退出(显示AssertionError)。用法为：assert 检测语句 “自设报错信息”

### 初始化对象

大多数面向对象编程语言都有构造函数(constructor)的概念，在这里完成创建对象和初始化；但对Python而言，它同时拥有构造函数和初始化方法。初始化方法即```__init__```，例子如下所示：

```python
class Point:
    def __init__(self,x,y):
        self.move(x,y)
        
    def move(self,x,y):
        self.x=x
        self.y=y
point=Point(3,5)
print(point.x,point.y)
```

其中```def __init__(self,x,y)```可以改为```def __init__(self,x=0,y=0)```以提供默认参数。

与```__init__```相对应的我们还有构造函数```__new__```，它只接收一个参数（不是self）同时返回新创建的对象。但此构造函数我们很少用到。

另外，为了提高程序的可读性，我们需要添加注释。Python通过字符串文档来支持注释，可以在每个类、函数、方法的定义语句之后添加字符串作为第一行。如“  ”，‘  ’，‘’‘   ’‘’。三者用途从略。

### 模块和包

模块(module)就是包含多个文件的项目中的每一个Python文件。import语句用于导入模块、类、函数。import语法有几种均可访问模块中的类，若我们想导入database.py中的Datebase类 ，我们可以：

```python
#第一种方法
import database
db=database.Database()

#第二种方法
from database import Database
db=Database()

#第三种方法
from database import Database as DB
db=DB()

#导入多个类
from database import Database， Query
```

一个**包**是一个目录下模块的集合，包的名字就是目录的名字，只需要在目录下添加一个名为\__init__.py的文件（通常是空文件）就可以告诉Python这个目录是一个包。我们考虑如下的层级：

```
parent_directory/
	main.py
	ecommerce/
		__init__.py
		database.py
		products.py
		payments/
			__init__.py
			square.py
			stripe.py
```

在包之间导入模块的语法有以下两种：

```python
#绝对导入：指定我们想导入的模块、函数或路径的完整路径
import ecommerce.products
product = ecommerce.products.Product()
#或者
from ecommerce.products import Product
product = Product()
#相对导入：当处理同一个包下的相关模块时，我们寻找与当前模块在位置上有相对关系的类、函数、或模块。
#对products.py
from .database import Database#同一级加.
#对square.py
from ..database import Database#上一级加..
```

最后，我们可以从包里导入代码，而不仅仅是模块。如果在ecommerce/\__init__.py文件里写入```from .database import db```我们就可以在main.py模块里直接访问db属性```from ecommerce import db```而不用写入完整路径了。

### 组织模块内容

**延迟创建全局变量**：在我们导入模块层代码时，所有模块层的代码将会立刻执行，而对其中的方法或函数，只会创建函数而不会执行内部代码（除非你调用了这个方法或函数）。样例如下：

```python
class Database:
    #数据库的实现
    pass
database=None

def initialize_db():
    global database
    database=Database()
```

通常在写实用程序时，我们需要调用其他程序的类或方法，但是不想运行模块所在的全部代码层。这时我们通常将启动代码放到一个函数里，只有在将模块作为脚本运行是时才会执行这一函数：

```python
class UsefulClass:
    '''This class might be useful to other modules'''
    pass
def main():
    '''creates a useful class and does something with it for our
    module.这里写这个模块单独执行的代码'''
    useful=UsefulClass()
    print(useful)

if __name__ == '__main__':
    main()
```

方法定义在类里，类定义在模块里，模块存于包中，这是Python的典型顺序，但不是唯一可能出现的情况。类可以在任何地方定义，比如函数和方法的内部。由于是在函数内部作用域内创建的，因此从函数外无法获取这个类。在Python里，函数可以嵌套定义。

### 谁可以访问我的数据

在Python中，类的所有方法和属性都是对外公开的，如果我们想说明某个方法不应该公开使用，可以在文档字符串中表明这一点。依据惯例，我们可以在属性或者方法前加上一个下划线_的前缀，提示这是一个内部变量。另外，我们可以用双下划线\_\_来作为前缀，对相关的属性或方法实现**命名改装**。此时，属性被加上了\_<类名>的前缀，当方法在类内部访问变量时，会自动改回去；当外部的类要访问时，需要自己进行命名改装。外部对象虽然可以调用该方法但是需要额外的工作，从这种意义上强调此方法为私有。但是一般而言，我们采用单下划线提醒的方式，以免与系统本身的特殊方法冲突。命名改装例子如下：

```python
class SecretString:
    '''A not-at-all secure way to store a secret string'''
    def __init__(self,plain_string,pass_phrase):
        self.__plain_string=plain_string
        self.__pass_phrase=pass_phrase
    
    def decode(self,pass_phrase):
        if pass_phrase==self.__pass_phrase:
            return self.__plain_string
        else:
            return ''
secretstring=SecretString("girlfriendJY",'love')
print(secretstring.decode("love"))
#输出正确结果
print(secretstring.__plain_string)
#输出错误
print(secretstring._SecretString__plain_string)
#输出正确结果
```

### 第三方库与案例学习

见书p46，逃^-^
