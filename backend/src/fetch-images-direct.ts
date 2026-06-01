/**
 * 메뉴 이미지 직접 수집 (rate-limit 우회)
 * Wikimedia 이미지 CDN(upload.wikimedia.org)에서 원본 경로로 직접 다운로드한다.
 * 경로 규칙: commons/{md5[0]}/{md5[0:2]}/{filename}  (filename의 공백은 _ 로 치환 후 MD5)
 * API/commons.org 도메인을 거치지 않아 throttle(429)에 영향받지 않는다. (자유 라이선스)
 * 멱등: 이미 이미지가 있으면 건너뜀.
 */
import { getDatabase } from './database';
import path from 'path';
import fs from 'fs';
import https from 'https';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// 메뉴명 → 검증된 Commons 파일명
const FILE_BY_NAME: Record<string, string> = {
  '김치찌개': 'Korean_stew-Kimchi_jjigae-01.jpg',
  '된장찌개': 'Doenjang_jjigae.jpg',
  '불고기': 'Bulgogi.jpg',
  '제육볶음': 'Jeyuk-bokkeum.jpg',
  '비빔밥': 'Dolsot-bibimbap.jpg',
  '돈까스': 'Tonkatsu_by_yomi955.jpg',
  '계란말이': 'Gyeran-mari.jpg',
  '김치전': 'Korean.food-Kimchijeon-01.jpg',
  '떡볶이': 'Tteok-bokki.jpg',
  '감자튀김': 'Pommes-1.jpg',
  '콜라': 'Coca-Cola_glass.jpg',
  '사이다': 'Lemonade.jpg',
  '맥주': 'Lager.jpg',
  '소주': 'Soju_bottle.jpg',
  '아이스크림': 'Ice_Cream_dessert_02.jpg',
  '식혜': 'Korean_rice_punch-Sikhye-01.jpg',
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// Commons 파일명 → CDN 원본 URL
function cdnUrl(fileName: string): string {
  const normalized = fileName.replace(/ /g, '_');
  const md5 = crypto.createHash('md5').update(normalized).digest('hex');
  return `https://upload.wikimedia.org/wikipedia/commons/${md5[0]}/${md5.slice(0, 2)}/${encodeURIComponent(normalized)}`;
}

function download(url: string, dest: string, retries = 4): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { 'User-Agent': BROWSER_UA } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlink(dest, () => {});
          download(res.headers.location, dest, retries).then(resolve).catch(reject);
          return;
        }
        if ((res.statusCode === 429 || (res.statusCode || 0) >= 500) && retries > 0) {
          file.close();
          fs.unlink(dest, () => {});
          setTimeout(() => download(url, dest, retries - 1).then(resolve).catch(reject), 3000);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(dest, () => {});
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
    const fileName = FILE_BY_NAME[item.name];
    if (!fileName) {
      console.log(`  no mapping: ${item.name}`);
      failed++;
      continue;
    }
    const url = cdnUrl(fileName);
    const dest = path.join(UPLOAD_DIR, `menu-${item.id}.jpg`);
    try {
      await download(url, dest);
      db.prepare('UPDATE menu_items SET image_url = ? WHERE id = ?').run(`/uploads/menu-${item.id}.jpg`, item.id);
      console.log(`  OK   ${item.name}`);
      success++;
    } catch (err) {
      console.log(`  FAIL ${item.name}: ${(err as Error).message}  (${url})`);
      failed++;
    }
    await sleep(3000);
  }

  console.log(`\nDone. ${success} saved, ${skipped} skipped, ${failed} failed.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
