# Simoldes - Sistema de Controle

## Configuração do MongoDB

Este projeto utiliza MongoDB como banco de dados. Siga os passos abaixo para configurar:

1. Crie uma conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) ou use um servidor MongoDB local
2. Crie um cluster e obtenha sua string de conexão
3. Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
VITE_MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
```

4. Substitua `<username>`, `<password>` e `<cluster>` pelos valores corretos da sua conexão

## Estrutura do Banco de Dados

O banco de dados `simoldes` contém as seguintes coleções:

- `machines`: Informações sobre as máquinas
- `programs`: Programas de moldes
- `operation_history`: Histórico de operações
- `login_logs`: Logs de login e logout

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Construir para produção
npm run build

# Visualizar build de produção
npm run preview
```