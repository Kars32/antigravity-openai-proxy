import { transformOpenAIToAntigravity } from './lib/antigravity';

// Generate a realistic 100-turn roleplay conversation
const sampleMessages: any[] = [
  { role: 'system', content: 'You are an immersive narrative assistant.' },
  { role: 'system', content: 'Follow strict formatting rules.' },
];

for (let i = 0; i < 48; i++) {
  sampleMessages.push({ role: 'user', content: `Player action turn ${i}: inspect room and look for clues.` });
  sampleMessages.push({ role: 'assistant', content: `Narrator response ${i}: You see a dimly lit room with stone walls.` });
}

// Add tool interaction at the end
sampleMessages.push({
  role: 'assistant',
  content: 'Analyzing scene...',
  tool_calls: [{ id: 'call_scan', function: { name: 'scan_room', arguments: '{"depth":3}' } }]
});
sampleMessages.push({ role: 'tool', tool_call_id: 'call_scan', content: '{"items":["key","map"]}' });
sampleMessages.push({ role: 'user', content: 'Take the key.' });

const body = { messages: sampleMessages, model: 'gemini-3.8-flash-tiered' };
const resolved = { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 };

console.log(`Benchmarking transformOpenAIToAntigravity on a ${sampleMessages.length}-message history...`);

// Warmup
for (let i = 0; i < 500; i++) {
  transformOpenAIToAntigravity(body, resolved, 'benchmark-proj');
}

const ITERATIONS = 10000;
const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  transformOpenAIToAntigravity(body, resolved, 'benchmark-proj');
}
const elapsed = performance.now() - start;

console.log(`Completed ${ITERATIONS} iterations in ${elapsed.toFixed(2)}ms`);
console.log(`Average latency per transform: ${(elapsed / ITERATIONS).toFixed(4)}ms (${((elapsed / ITERATIONS) * 1000).toFixed(1)}µs)`);
console.log(`Throughput: ${Math.round((ITERATIONS / elapsed) * 1000)} transforms/sec`);
