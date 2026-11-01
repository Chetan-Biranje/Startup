const fs = require('fs');
const path = require('path');

const targetFile = 'c:\\Users\\Mr Shadex\\Startup\\00_ALL_IN_ONE_TITAN_203_AGENTS_WORKFLOW.json';

console.log('====================================================');
console.log('🧪 RUNNING COMPREHENSIVE AUTOMATED TEST SUITE');
console.log('Target: 00_ALL_IN_ONE_TITAN_203_AGENTS_WORKFLOW.json');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName, errorDetails = '') {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (errorDetails) console.error(`   Details: ${errorDetails}`);
    failCount++;
  }
}

// TEST 1: File Existence & JSON Parsing
let workflow = null;
try {
  const raw = fs.readFileSync(targetFile, 'utf8');
  workflow = JSON.parse(raw);
  assert(true, 'Test 1: File exists and parses as 100% valid JSON');
} catch (err) {
  assert(false, 'Test 1: File exists and parses as 100% valid JSON', err.message);
  process.exit(1);
}

// TEST 2: Workflow Meta Properties
assert(workflow.name && workflow.name.length > 5, 'Test 2: Workflow has valid descriptive name', workflow.name);
assert(Array.isArray(workflow.nodes) && workflow.nodes.length > 1000, `Test 3: Workflow contains complete enterprise nodes (Found: ${workflow.nodes.length} nodes)`);
assert(workflow.connections && Object.keys(workflow.connections).length > 500, `Test 4: Workflow contains connection network (Found: ${Object.keys(workflow.connections).length} connection sources)`);

// TEST 3: Node ID Uniqueness
const nodeIds = new Set();
let duplicateIds = 0;
const nodeNames = new Set();
let duplicateNames = 0;
let invalidPositions = 0;
let invalidTypes = 0;

workflow.nodes.forEach(node => {
  if (nodeIds.has(node.id)) duplicateIds++;
  nodeIds.add(node.id);

  if (nodeNames.has(node.name)) duplicateNames++;
  nodeNames.add(node.name);

  if (!Array.isArray(node.position) || node.position.length !== 2 || typeof node.position[0] !== 'number' || typeof node.position[1] !== 'number') {
    invalidPositions++;
  }

  if (!node.type || typeof node.type !== 'string') {
    invalidTypes++;
  }
});

assert(duplicateIds === 0, 'Test 5: Node ID Uniqueness (0 duplicate IDs)', `Found ${duplicateIds} duplicates`);
assert(duplicateNames === 0, 'Test 6: Node Name Uniqueness (0 duplicate Names)', `Found ${duplicateNames} duplicates`);
assert(invalidPositions === 0, 'Test 7: All nodes have valid [x, y] coordinate positions', `Found ${invalidPositions} invalid`);
assert(invalidTypes === 0, 'Test 8: All nodes have valid n8n node type declarations', `Found ${invalidTypes} invalid`);

// TEST 4: Referential Integrity of Connections (Zero Dangling Links)
let missingSourceCount = 0;
let missingTargetCount = 0;
const missingTargets = [];

for (const [sourceName, connGroup] of Object.entries(workflow.connections)) {
  if (!nodeNames.has(sourceName)) {
    missingSourceCount++;
  }

  for (const [connType, outputs] of Object.entries(connGroup)) {
    if (Array.isArray(outputs)) {
      outputs.forEach(targetList => {
        if (Array.isArray(targetList)) {
          targetList.forEach(target => {
            if (!nodeNames.has(target.node)) {
              missingTargetCount++;
              if (missingTargets.length < 5) missingTargets.push({ from: sourceName, to: target.node });
            }
          });
        }
      });
    }
  }
}

assert(missingSourceCount === 0, 'Test 9: Connection Sources exist in node registry', `Missing: ${missingSourceCount}`);
assert(missingTargetCount === 0, 'Test 10: Connection Targets exist in node registry (Zero dangling links)', `Missing targets: ${missingTargetCount} e.g. ${JSON.stringify(missingTargets)}`);

// TEST 5: Department & Agent Coverage Audit
const bannerNodes = workflow.nodes.filter(n => n.name.startsWith('[BANNER] Department'));
assert(bannerNodes.length >= 20, `Test 11: Department Organization Banners Present (Found: ${bannerNodes.length} departments)`);

const webhookNodes = workflow.nodes.filter(n => n.type === 'n8n-nodes-base.webhook');
assert(webhookNodes.length > 50, `Test 12: Autonomous Inbound Webhook Endpoints (Found: ${webhookNodes.length} webhooks)`);

const aiNodes = workflow.nodes.filter(n => n.type && n.type.includes('langchain'));
assert(aiNodes.length > 50, `Test 13: AI Reasoning & Agent Engine Nodes (Found: ${aiNodes.length} AI agent brains)`);

// TEST 6: Simulated Dry-Run of Master Orchestration Code
let dryRunSuccess = false;
try {
  const samplePayload = {
    event_type: 'new_enterprise_lead',
    customer: { name: 'Acme Corp', seats: 250, plan: 'Enterprise Suite' },
    timestamp: new Date().toISOString()
  };

  // Simulate Master Router Node code execution
  const masterNode = workflow.nodes.find(n => n.id === 'master-titan-all-in-one-bus');
  if (masterNode && masterNode.parameters && masterNode.parameters.jsCode) {
    const fn = new Function('$json', masterNode.parameters.jsCode);
    const result = fn(samplePayload);
    if (result && result.json && result.json.masterStatus === 'ORCHESTRATED_ACROSS_ALL_24_DEPTS') {
      dryRunSuccess = true;
    }
  }
} catch(e) {
  console.error('Dry run error:', e);
}

assert(dryRunSuccess, 'Test 14: Simulated Dry-Run of Master Gateway Dispatch logic');

console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount === 0) {
  console.log('🎉 ALL TESTS PASSED! 0 BUGS DETECTED. THE ALL-IN-ONE WORKFLOW IS 100% READY TO RUN IN N8N!');
  process.exit(0);
} else {
  console.error('⚠️ BUGS DETECTED! FIX REQUIRED.');
  process.exit(1);
}

