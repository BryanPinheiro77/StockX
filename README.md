# StockX 💹✨  

![Angular](https://img.shields.io/badge/Angular-17-DD0031?style=for-the-badge&logo=angular&logoColor=white)  
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)  
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)  
![ZXingScanner](https://img.shields.io/badge/ZXing-Scanner-lightgrey?style=for-the-badge)  
![Status](https://img.shields.io/badge/STATUS-Em%20Desenvolvimento-orange?style=for-the-badge)  

---

## 📌 Sobre o Projeto  
O **StockX** é um sistema web de **gerenciamento de estoque e vendas**, desenvolvido como projeto pessoal para praticar **Angular** e **Firebase/Firestore**.  

Ele permite cadastrar produtos, controlar estoque, registrar vendas (com múltiplos itens) e analisar resultados em **dashboards interativos**.  

Criado para simular um sistema de gestão comercial moderno, ajudando a treinar boas práticas de front-end e integração em tempo real com banco de dados na nuvem.  

---

## ✨ Funcionalidades  
- 📦 Cadastro de produtos (nome, preço, custo, categoria, estoque mínimo)  
- 📊 Controle de estoque com destaque para itens em falta  
- 🛒 Registro de vendas:  
  - Produtos cadastrados ou manuais  
  - Tipo de cliente (normal ou mecânico)  
  - Seleção de forma de pagamento  
  - Múltiplos itens por venda  
- 📈 Dashboard com gráficos dinâmicos:  
  - Meta mensal  
  - Lucro vs custo  
  - Origem do lucro (pizza)  
  - Filtros de análise (diária, semanal, mensal)  
- 🔍 Leitura de código de barras com **ZXingScanner**  

---

## ▶️ Como Executar o Projeto  

1. Clone o repositório  
```bash
git clone https://github.com/BryanPinheiro77/StockX.git
```

2. Entre na pasta do projeto  
```bash
cd StockX
```

3. Instale as dependências  
```bash
npm install
```

4. Configure o Firebase  
- Crie um projeto no [Firebase Console](https://console.firebase.google.com/)  
- Copie as credenciais de configuração  
- Substitua no arquivo `environment.ts`  

5. Execute o projeto  
```bash
ng serve
```

6. Acesse no navegador  
```
http://localhost:4200
```

---

## 📸 Demonstração  
*(adicione prints ou GIFs do sistema rodando aqui)*  

---

## 📌 Status do Projeto  
✔ Funcional – em desenvolvimento contínuo  
🔜 Próximas features:  
- CRUD de fornecedores  
- Tela de configurações (meta mensal, estoque mínimo, etc.)  
- Cadastro simples de clientes  

---

## 👨‍💻 Autor  
**Bryan Mendes Pinheiro**  
- [LinkedIn](https://www.linkedin.com/in/bryan-mendes-0406b92b5)  
- [GitHub](https://github.com/BryanPinheiro77)  
