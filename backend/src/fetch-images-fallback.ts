/**
 * 누락 메뉴 이미지 폴백 수집 (LoremFlickr - Flickr CC 사진, 키워드 매칭)
 * Wikimedia가 현재 IP를 throttle(429)하므로, 독립 호스트에서 키워드로 관련 사진을 받는다.
 * 멱등: 이미 이미지가 있으면 건너뜀.
 */
import { getDatabase } from './database';
import path from 'path';
import fs from 'fs';
import https from 'https';

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// 메뉴명 → LoremFlickr 키워드(쉼표 구분 = AND 태그)
const KEYWORDS_BY_NAME: Record<string, string> = {
  '김치찌개': 'kimchi,stew,korean,food',
  '계란말이': 'rolled,omelette,egg,korean',
  '김치전': 'kimchi,pancake,korean,food',
  '떡볶이': 'tteokbokki,korean,food',
  '사이다': 'lemon,lime,soda,drink',
  // (나머지는 이미 Wikimedia에서 수집됨)
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// 리다이렉트를 따라가 최종 URL을 해석 (본문은 받지 않음)
function resolveFinalUrl(url: string, hops = 5): Promise<string> {
  return new Promise((resolve, reject) => {
    if (hops <= 0) return resolve(url);
    https
      .get(url, { headers: { 'User-Agent': BROWSER_UA } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, url).toString();
          res.resume(); // 본문 버림
          resolveFinalUrl(next, hops - 1).then(resolve).catch(reject);
          return;
        }
        res.resume();
        resolve(url);
      })
      .on('error', reject);
  });
}

function downloadDirect(url: string, dest: string, retries = 4): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { 'User-Agent': BROWSER_UA } }, (res) => {
        if ((res.statusCode === 429 || (res.statusCode || 0) >= 500) && retries > 0) {
          file.close();
          fs.unlink(dest, () => {});
          res.resume();
          setTimeout(() => downloadDirect(url, dest, retries - 1).then(resolve).catch(reject), 3000);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(dest, () => {});
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
      })
      .on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function download(url: string, dest: string): Promise<void> {
  const finalUrl = await resolveFinalUrl(url);
  await downloadDirect(finalUrl, dest);
}

async function main() {
  const db = getDatabase();
  const items = db.prepare('SELECT id, name, image_url FROM menu_items').all() as
    { id: string; name: string; image_url: string | null }[];

  let success = 0, skipped = 0, failed = 0;

  for (const item of items) {
    if (item.image_url && fs.existsSync(path.join(UPLOAD_DIR, path.basename(item.image_url)))) {
      skipped++;
      continue;
    }
    const keywords = KEYWORDS_BY_NAME[item.name];
    if (!keywords) {
      console.log(`  no fallback keyword: ${item.name}`);
      failed++;
      continue;
    }
    // lock=숫자 로 매 메뉴마다 고정된(재현가능) 사진 선택
    const seed = Math.abs([...item.id].reduce((a, c) => a + c.charCodeAt(0), 0)) % 500 + 1;
    const url = `https://loremflickr.com/640/480/${keywords}?lock=${seed}`;
    const dest = path.join(UPLOAD_DIR, `menu-${item.id}.jpg`);
    try {
      await download(url, dest);
      const size = fs.statSync(dest).size;
      if (size < 2000) throw new Error(`too small (${size} bytes)`);
      db.prepare('UPDATE menu_items SET image_url = ? WHERE id = ?').run(`/uploads/menu-${item.id}.jpg`, item.id);
      console.log(`  OK   ${item.name} (${(size / 1024).toFixed(1)}KB)`);
      success++;
    } catch (err) {
      console.log(`  FAIL ${item.name}: ${(err as Error).message}`);
      failed++;
    }
    await sleep(1500);
  }

  console.log(`\nDone. ${success} saved, ${skipped} skipped, ${failed} failed.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
