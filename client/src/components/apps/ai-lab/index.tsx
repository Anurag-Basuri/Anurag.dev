import { useState } from 'react';

export function AILabModule() {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	return (
        <div>
            <h1 className="text-2xl font-bold">AI Lab</h1>
            <input value={input} onChange={e => setInput(e.target.value)} />
            <button onClick={() => setOutput(input)}>Submit</button>
            <p>{output}</p>
		</div>
	);
}
