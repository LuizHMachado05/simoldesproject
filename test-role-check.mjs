// Simular o objeto operador retornado pela API
const operator = {
  "_id": "685b51bbeaa8554cead1c884",
  "matricula": "002",
  "name": "Luiz Henrique",
  "code": "luiz",
  "role": "admin",
  "cargo": "Supervisor",
  "turno": "Manhã",
  "active": true,
  "createdAt": "2025-06-25T01:32:43.627Z",
  "updatedAt": "2025-06-25T01:32:43.627Z"
};

console.log('🧪 Testando verificação de role...');
console.log('👤 Operador:', operator.name);
console.log('🔑 Role:', operator.role);
console.log('📝 Tipo da role:', typeof operator.role);

// Testar as verificações que estão no App.tsx
console.log('\n🔍 Testando verificações de role:');

const checks = [
  { name: 'operator?.role === "admin"', result: operator?.role === 'admin' },
  { name: 'operator.role === "admin"', result: operator.role === 'admin' },
  { name: 'operator.role === "operator"', result: operator.role === 'operator' },
  { name: 'operator.role === "supervisor"', result: operator.role === 'supervisor' },
  { name: 'operator.role === "ADMIN"', result: operator.role === 'ADMIN' },
  { name: 'operator.role === "Admin"', result: operator.role === 'Admin' },
];

checks.forEach(check => {
  console.log(`  ${check.name}: ${check.result ? '✅' : '❌'}`);
});

// Testar se a role está sendo tratada como string
console.log('\n📊 Verificações adicionais:');
console.log('  Role é string:', typeof operator.role === 'string');
console.log('  Role tem length:', operator.role.length);
console.log('  Role em maiúsculo:', operator.role.toUpperCase());
console.log('  Role em minúsculo:', operator.role.toLowerCase());

// Testar comparação com diferentes tipos
console.log('\n🔧 Testando comparações:');
console.log('  "admin" === "admin":', 'admin' === 'admin');
console.log('  operator.role === "admin":', operator.role === 'admin');
console.log('  String(operator.role) === "admin":', String(operator.role) === 'admin'); 