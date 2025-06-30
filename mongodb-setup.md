# Configuração do MongoDB para o Sistema Simoldes

## Banco de Dados
Nome: `simoldes`

## Collections Necessárias

### 1. Collection: `operators`
Armazena informações sobre os operadores/usuários do sistema.

Exemplo de documento:
```json
{
  "_id": ObjectId("..."),
  "matricula": "123456",
  "nome": "Luiz Henrique",
  "cargo": "Operador CNC",
  "turno": "Manhã"
}
```

### 2. Collection: `machines`
Armazena informações sobre as máquinas CNC.

Exemplo de documento:
```json
{
  "_id": ObjectId("..."),
  "codigo_maquina": "F1400",
  "nome_maquina": "Fresadora CNC 1400",
  "status": "ativo",
  "senha": "",
  "tipo": "Fresadora CNC",
  "capacidade": "1400x800x600mm",
  "ultima_manutencao": "2023-05-15"
}
```

### 3. Collection: `programs`
Armazena informações sobre os programas de usinagem.

Exemplo de documento:
```json
{
  "_id": ObjectId("..."),
  "id": "1668_18",
  "name": "MOLDE CARCAÇA FRONTAL",
  "machine": "F1400",
  "programPath": "U:/F1400/1668_18",
  "material": "1730",
  "date": "10/02/2024",
  "programmer": "diego.verciano",
  "blockCenter": "X0,0 Y0,0",
  "reference": "EM Z: 20,0",
  "observations": "PRENDER SOBRE CALÇOS DE 10mm",
  "imageUrl": "/images/program-cover.jpg",
  "operations": [
    {
      "id": 1,
      "sequence": "07",
      "type": "Furação",
      "function": "Centro",
      "centerPoint": "48",
      "toolRef": "BK_TOPDRIL_D44_SSD_701800011",
      "ic": "247",
      "alt": "273",
      "time": {
        "machine": "10:30:12",
        "total": "10:38:15"
      },
      "details": {
        "depth": "120mm",
        "speed": "2400 RPM",
        "feed": "0.15mm/rev",
        "coolant": "Externa 40 bar",
        "notes": "Verificar alinhamento antes de iniciar"
      }
    }
  ]
}
```

### 4. Collection: `logs` (opcional)
Armazena logs do sistema para rastreamento de atividades.

Exemplo de documento:
```json
{
  "_id": ObjectId("..."),
  "id": "LOG001",
  "type": "Operação",
  "user": "Luiz Henrique",
  "machine": "F1400",
  "timestamp": "2024-05-10T14:30:45",
  "details": "Início de operação: MOLDE CARCAÇA FRONTAL"
}
```