import { handleFeed } from '../../shared/feeds.js';
export function onRequest(context) { return handleFeed(context.request, context.env, context, 'news'); }
