// const fetch = require('node-fetch'); // Native fetch in Node 18+

async function testApi() {
    const baseUrl = 'http://localhost:3003/api';
    const ownerId = 'test-user-123';

    console.log('1. Creating Project...');
    const createRes = await fetch(`${baseUrl}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Project', ownerId })
    });

    if (!createRes.ok) {
        console.error('Create Project Failed:', await createRes.text());
        return;
    }

    const project = await createRes.json();
    console.log('Project Created:', project.id);

    console.log('2. Creating File...');
    const createFileRes = await fetch(`${baseUrl}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'test.ts',
            type: 'file',
            projectId: project.id,
            content: 'console.log("Hello World")'
        })
    });

    if (!createFileRes.ok) {
        console.error('Create File Failed:', await createFileRes.text());
        return;
    }

    const file = await createFileRes.json();
    console.log('File Created:', file.id);

    console.log('3. Fetching Project Files...');
    const getFilesRes = await fetch(`${baseUrl}/files?projectId=${project.id}`);
    const files = await getFilesRes.json();
    console.log('Files Found:', files.length);
    console.log('File Names:', files.map(f => f.name));
}

testApi().catch(console.error);
