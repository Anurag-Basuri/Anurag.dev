import { Request, Response } from 'express';
import { getOgImage } from '../services/link-preview.service';
import { ApiResponse } from '../utils/ApiResponse';

async function getLinkPreview(req: Request, res: Response): Promise<void> {
	const url = req.query.url as string | undefined;

	if (!url || typeof url !== 'string') {
		res.status(400).json({ error: { message: 'Missing "url" query parameter' } });
		return;
	}

	// Basic URL validation — only allow http(s)
	if (!url.startsWith('http://') && !url.startsWith('https://')) {
		res.status(400).json({ error: { message: 'URL must start with http:// or https://' } });
		return;
	}

	const ogImage = await getOgImage(url);
	ApiResponse.ok(res, { ogImage });
}

export { getLinkPreview };
