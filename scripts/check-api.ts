#!/usr/bin/env node

/**
 * Script de vérification de la connexion API
 * Teste tous les endpoints pour s'assurer que les données sont accessibles
 */

const BASE_URL: string = 'http://localhost:3001';

interface ApiResponse {
  [key: string]: unknown;
}

const endpoints: string[] = [
  '/users',
  '/animals',
  '/meals',
  '/distributions',
  '/distributorStatus',
  '/notifications',
  '/planning',
  '/statistics',
  '/behaviorAnalysis',
];

async function checkEndpoint(endpoint: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data: ApiResponse = await response.json();

    const itemCount: number = Array.isArray(data) ? data.length : Object.keys(data).length;
    console.log(`✅ ${endpoint.padEnd(20)} - ${itemCount} items`);

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`❌ ${endpoint.padEnd(20)} - Error: ${errorMessage}`);
    return false;
  }
}

async function main(): Promise<void> {
  console.log('🔍 Vérification de la connexion API...\n');
  console.log(`URL de base: ${BASE_URL}\n`);

  let successCount: number = 0;
  for (const endpoint of endpoints) {
    const success = await checkEndpoint(endpoint);
    if (success) successCount++;
  }

  console.log(`\n✅ ${successCount}/${endpoints.length} endpoints accessibles\n`);

  if (successCount === endpoints.length) {
    console.log("✨ L'API fonctionne correctement!");
    process.exit(0);
  } else {
    console.log('⚠️  Certains endpoints ne sont pas accessibles.');
    console.log('Assurez-vous que le mock-server est lancé avec: npm start (dans mock-api/)');
    process.exit(1);
  }
}

main();
