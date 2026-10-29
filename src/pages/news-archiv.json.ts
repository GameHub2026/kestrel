// Das News-Archiv (zweimal täglich gefüllt) als Datei für die Merkliste: beobachtete Titel werden darin gesucht.
import archiv from '../data/news-archiv.json';
export const GET = () => new Response(JSON.stringify(archiv), { headers: { 'content-type': 'application/json; charset=utf-8' } });
