# embedNeoBrowser

嵌入的neo4j 前端

---

# 环境搭建

1. git clone 
2. npm install 安装依赖
3. npm start 启动，默认端口3000

---

# iframe 嵌入

```
<iframe
  style={{
    width: '100%',
    height: '600px',
  }}
  scrolling={'no'}
  frameBorder={'0'}
  src={`http://localhost:3000/browser/NeoEmbed.html?query=${encodeURIComponent(queryUri).replace(/=/g, '%3d')}`} ></iframe>
```

queryUri 是cypher 查询语句，如 `match (n) return (n) limit 25`

---

# 配置

**配置neo4j 后端http url**

修改文件`public/browser/scripts/248a7ab3.scripts.js`
```
baseURL = "http://localhost:7474"
```

**配置neo4j 后端bolt host**
修改文件`public/browser/scripts/248a7ab3.scripts.js`
```
boltHost: "localhost:7687"
```