#!/bin/bash
# 自动化部署脚本 - 将项目构建并部署到GitHub Pages

# 删除之前的构建产物
rm -rf dist &&

# 执行项目构建
pnpm build &&

# 进入构建目录
cd dist &&

# 初始化Git仓库
git init &&

# 添加所有文件到Git
git add . &&

# 提交代码
git commit -m "update" &&

# 设置主分支
git branch -M main &&

# 添加远程仓库地址
git remote add origin git@github.com:Rabbitroll99/ciallo-ui-vue3-website.git &&

# 强制推送到远程仓库
git push -f -u origin main &&

# 返回项目根目录
cd -

# 输出部署后的访问地址
echo https://rabbitroll99.github.io/ciallo-ui-vue3-website/index.html