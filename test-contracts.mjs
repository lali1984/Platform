import contracts from '@platform/contracts';

console.log('Contracts package loaded successfully!');
console.log('Available exports:');
for (const key of Object.keys(contracts)) {
  console.log(`  - ${key}`);
}

// Тестируем конкретные импорты
console.log('\nTesting specific imports:');
console.log('Contracts.VERSION:', contracts.Contracts?.VERSION);
