import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Read API key
let apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
  try {
    if (fs.existsSync('/app/.dev.env.json')) {
      const envData = JSON.parse(fs.readFileSync('/app/.dev.env.json', 'utf8'));
      apiKey = envData.GEMINI_API_KEY || '';
    }
  } catch (e) {
    // ignore
  }
}

app.use(express.json({ limit: '50mb' }));

// In-memory sessions store fallback if needed
const sessions: Record<string, any> = {};

app.get('/api/sessions', (req, res) => {
  res.json({ status: 'ok', sessions });
});

// AI 캡처 사진 분석 엔드포인트
app.post('/api/sessions/parse-screenshots', async (req, res) => {
  try {
    const { images } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: '분석할 이미지가 없습니다.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format parts for Gemini
    const contents: any[] = [];
    images.forEach((img: { mimeType: string; data: string }) => {
      // Remove data:image/...;base64, prefix if present
      const base64Data = img.data.includes(',') ? img.data.split(',')[1] : img.data;
      contents.push({
        inlineData: {
          mimeType: img.mimeType || 'image/png',
          data: base64Data,
        },
      });
    });

    const prompt = `
이 이미지들은 배드민턴 클럽 모임의 참석자 투표 명단(카카오톡 투표, 네이버 밴드 등) 또는 게스트 신청 댓글 화면 캡처입니다.
이미지에서 참석 회원 명단을 정확히 추출해주세요.

다음 규칙을 준수하여 JSON으로만 응답해주세요:
1. 회원의 이름(name), 급수(rank: 'S'|'A'|'B'|'C'|'D'|'E'|'F' 중 하나, 미기재 시 'D'), 성별(gender: 'M'|'F', 미기재 시 이름이나 문맥으로 추정하거나 'M')을 파악하세요.
2. 게스트 회원은 이름 끝에 'G'를 붙여주세요 (예: 홍길동G). 게스트 여부(isGuest: true/false)도 표시하세요.
3. 정회원 수(regularCount), 게스트 수(guestCount), 회원 배열(members)을 반환하세요.

응답 형식 (JSON):
{
  "regularCount": number,
  "guestCount": number,
  "members": [
    {
      "name": "홍길동",
      "rank": "B",
      "gender": "M",
      "isGuest": false
    }
  ]
}
`;
    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    const members = (parsed.members || []).map((m: any, idx: number) => ({
      id: `member-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      name: m.name || `회원${idx + 1}`,
      rank: ['S', 'A', 'B', 'C', 'D', 'E', 'F'].includes(m.rank) ? m.rank : 'D',
      gender: m.gender === 'F' ? 'F' : 'M',
      isGuest: Boolean(m.isGuest || m.name?.endsWith('G')),
      status: 'left',
      order: idx + 1,
      shuttlecockSubmitted: false,
      consecutiveGames: 0,
      todayGamesCount: 0,
      playedGamesCount: 0,
      createdAt: new Date().toISOString(),
    }));

    res.json({
      status: 'ok',
      regularCount: parsed.regularCount || members.filter((m: any) => !m.isGuest).length,
      guestCount: parsed.guestCount || members.filter((m: any) => m.isGuest).length,
      members,
    });
  } catch (error: any) {
    console.error('Error parsing screenshots:', error);
    res.status(500).json({ error: error.message || '캡처 이미지 분석 중 오류가 발생했습니다.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HighCock server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
