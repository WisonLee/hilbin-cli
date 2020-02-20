#**Hilbin-cli**
快速搭建工程，提供微前端模板
##起步

安装

`npm install @hilbin/cli -g`

创建一个项目：

`hilbin init my-project`

创建业务，快速创建action、constant、saga、container文件

`hilbin create file-name`

提供了单独创建文件

```
hilbin create file-name -a|-c|-s|-m

-a: 创建action文件
-c: 创建constant文件
-s: 创建saga文件
-m: 创建container文件
```

##说明
初始化项目时，会提示选择模板路径

```
? 请选择微前端工程模板： (Use arrow keys)
> 主工程应用模板
  子工程应用模板
```
选择模板之后，会提示网络环境，在公司内网时，选择内网。
```
? 请选择网络环境： (Use arrow keys)
> 外网
  内网
```


在*bussModule*会看到有这么一段注释/*router*/，这是用于创建业务命令时，标记插入的位置。
```
使用创建命令前
...
const routesMainProject = {
  Index: Loadable({
    loader: () =>
      import(/* webpackChunkName: 'CustomerMenu' */ 'containers/buss/Index/default')
  })/*router*/
}
...
```
```
使用创建命令后
...
const routesMainProject = {
  Index: Loadable({
    loader: () =>
      import(/* webpackChunkName: 'CustomerMenu' */ 'containers/buss/Index/default')
  }),
  DashBoard: Loadable({
    loader: () =>
      import(/* webpackChunkName: 'DashBoard' */ 'containers/buss/DashBoard/default')
  })/*router*/
}
...
```

同理，在*sagas/buss/default*也是一样