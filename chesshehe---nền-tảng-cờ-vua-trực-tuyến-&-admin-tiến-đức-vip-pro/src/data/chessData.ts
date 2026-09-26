import { TacticalPuzzle, ChessArticle, TimeControlConfig } from '../types';

export const TIME_CONTROLS: TimeControlConfig[] = [
  {
    key: '1+0',
    label: '1 phút (Bullet)',
    category: 'Bullet',
    baseMinutes: 1,
    incrementSeconds: 0,
    iconName: 'Zap',
  },
  {
    key: '3+0',
    label: '3 phút (Blitz)',
    category: 'Blitz',
    baseMinutes: 3,
    incrementSeconds: 0,
    iconName: 'Flame',
  },
  {
    key: '3+2',
    label: '3 + 2s (Blitz)',
    category: 'Blitz',
    baseMinutes: 3,
    incrementSeconds: 2,
    iconName: 'Flame',
  },
  {
    key: '5+0',
    label: '5 phút (Blitz)',
    category: 'Blitz',
    baseMinutes: 5,
    incrementSeconds: 0,
    iconName: 'Timer',
  },
  {
    key: '10+0',
    label: '10 phút (Rapid)',
    category: 'Rapid',
    baseMinutes: 10,
    incrementSeconds: 0,
    iconName: 'Clock',
  },
  {
    key: '15+10',
    label: '15 + 10s (Rapid)',
    category: 'Rapid',
    baseMinutes: 15,
    incrementSeconds: 10,
    iconName: 'Hourglass',
  },
];

export const INITIAL_PUZZLES: TacticalPuzzle[] = [
  {
    id: 'puz-01',
    title: 'Đòn Chĩa Đôi (Royal Knight Fork)',
    rating: 1250,
    theme: ['Đòn Chĩa', 'Tấn công Vua & Hậu', 'Chiến thuật Trung cuộc'],
    fen: 'r1b1k2r/pppp1ppp/8/4n3/1b1NP2q/2N5/PPP2PPP/R1BQKB1R w KQkq - 1 8',
    turnToMove: 'w',
    opponentInitialMove: { from: 'd7', to: 'd5', san: 'd5' },
    solutionMoves: [
      { from: 'd4', to: 'f5', san: 'Nf5' },
      { from: 'h4', to: 'f6', san: 'Qf6' },
      { from: 'f5', to: 'g7', san: 'Nxg7#' }
    ],
    hint: 'Tìm vị trí nhảy mã gây áp lực lớn lên các ô yếu ở cánh vua của đối phương.',
    explanation: 'Nước nhảy Mã f5 khai thác cấu trúc suy yếu ở f7/g7 đồng thời dọa chiếu bí và bắt quân.'
  },
  {
    id: 'puz-02',
    title: 'Chiếu Hết Hành Lang (Back-Rank Mate)',
    rating: 1380,
    theme: ['Chiếu Hết', 'Hàng 8 Yếu', 'Hy sinh Xe'],
    fen: '3r2k1/5ppp/8/8/8/8/4RPPP/6K1 w - - 0 1',
    turnToMove: 'w',
    opponentInitialMove: { from: 'd8', to: 'd1', san: 'Rd1+' },
    solutionMoves: [
      { from: 'e2', to: 'e1', san: 'Re1' },
      { from: 'd1', to: 'e1', san: 'Rxe1#' }
    ],
    hint: 'Khi hàng ngang cuối cùng không có lối thoát (không có ô thở cho vua), các đòn hy sinh hoặc chặn chiếu sẽ quyết định ván đấu.',
    explanation: 'Vua đen bị chặn hoàn toàn bởi hàng tốt f7, g7, h7. Xe kiểm soát hàng 1 dứt điểm trận đấu.'
  },
  {
    id: 'puz-03',
    title: 'Đòn Ghim Tuyệt Đối (Absolute Pin on Queen)',
    rating: 1520,
    theme: ['Đòn Ghim (Pin)', 'Bắt Hậu', 'Tận dụng Tượng'],
    fen: 'r1b1k2r/pp3ppp/2n1p3/3p4/3P4/b1q1BN2/P1P2PPP/1R1QKB1R w Kkq - 2 11',
    turnToMove: 'w',
    opponentInitialMove: { from: 'c3', to: 'b2', san: 'Qxb2' },
    solutionMoves: [
      { from: 'e3', to: 'd2', san: 'Bd2' },
      { from: 'b2', to: 'b3', san: 'Qb3' },
      { from: 'b1', to: 'b3', san: 'Rxb3' }
    ],
    hint: 'Hãy bẫy quân Hậu đối phương khi nó tham ăn tốt ở hàng dưới.',
    explanation: 'Đòn phát triển tượng d2 ghim và bẫy đường rút lui của Hậu đối phương trên cột mở.'
  },
  {
    id: 'puz-04',
    title: 'Chiếu Thắt (Smothered Mate - Philidor)',
    rating: 1850,
    theme: ['Smothered Mate', 'Hy Sinh Hậu', 'Mã Độc Cô'],
    fen: '6k1/5ppp/8/8/8/5Q2/6PP/4R1K1 w - - 0 1',
    turnToMove: 'w',
    opponentInitialMove: { from: 'g8', to: 'h8', san: 'Kh8' },
    solutionMoves: [
      { from: 'f3', to: 'a8', san: 'Qa8+' },
      { from: 'h8', to: 'g8', san: 'Qxa8' }
    ],
    hint: 'Hãy tìm nước chiếu ép vua vào góc trước khi tung đòn quyết định.',
    explanation: 'Mô hình kinh điển ép đối phương tự lấy quân của mình chặn đường thoát của Vua.'
  }
];

export const CHESS_NEWS: ChessArticle[] = [
  {
    id: 'art-01',
    title: 'Chiến Lược Khai Cuộc: 5 Nguyên Tắc Vàng Của Đại Kiện Tướng',
    category: 'Khai cuộc',
    author: 'GM Nguyễn Ngọc Trường Sơn',
    publishDate: '15/03/2026',
    readTime: '6 phút',
    summary: 'Phân tích cách chiếm trung tâm, phát triển quân nhẹ nhịp nhàng và đảm bảo an toàn cho Vua trước nước thứ 10.',
    content: `Trong cờ vua hiện đại, việc nhớ máy móc hàng chục nước đi khai cuộc (opening theory) không mang lại hiệu quả bền vững bằng việc thấu hiểu bản chất chiến lược. Dưới đây là 5 nguyên tắc cốt lõi:
    
1. **Kiểm soát các ô trung tâm (e4, d4, e5, d5):** Chiếm lĩnh trung tâm bằng tốt hoặc tạo hỏa lực quân nhẹ nhắm vào trung tâm.
2. **Phát triển Mã trước Tượng:** Mã có tầm di chuyển ngắn hơn nên cần xác định vị trí sớm, thường là c3/f3 (với Trắng) hoặc c6/f6 (với Đen).
3. **Không di chuyển cùng một quân nhiều lần ở khai cuộc:** Mỗi nhịp (tempo) đều quý giá. Di chuyển một quân nhiều lần mà không tạo mối đe dọa trực tiếp sẽ tạo thời cơ cho đối thủ vượt trội về phát triển quân.
4. **Nhập thành sớm để bảo vệ Vua:** Đưa Vua vào nơi an toàn sau bức tường tốt và kích hoạt Xe tham gia cuộc chiến trung tâm.
5. **Liên kết các quân Xe:** Di chuyển Hậu hợp lý để hai Xe nhìn thấy nhau trên hàng ngang đầu tiên, chính thức kết thúc giai đoạn khai cuộc.`,
    coverImage: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80',
    tags: ['Khai cuộc', 'Chiến lược', 'Căn bản']
  },
  {
    id: 'art-02',
    title: 'Tích Hợp Stockfish Engine Vào Web Hiện Đại: WebAssembly vs Cloud API',
    category: 'Phân tích ván đấu',
    author: 'Ban Kỹ Thuật chesshehe',
    publishDate: '12/03/2026',
    readTime: '9 phút',
    summary: 'So sánh ưu nhược điểm giữa việc chạy Stockfish Wasm trực tiếp trên trình duyệt bằng Web Worker và dựng Server-side UCI Cluster.',
    content: `Để cung cấp khả năng phân tích ván đấu và chơi với máy theo chuẩn FIDE, việc lựa chọn kiến trúc tích hợp Stockfish là bài toán kỹ thuật trọng tâm:

- **Stockfish Wasm (Client-side Web Worker):**
  - *Ưu điểm:* Tiết kiệm 100% chi phí CPU server. Trình duyệt client chạy trực tiếp mã biên dịch C++ qua WebAssembly, tận dụng đa luồng (Web Workers & SharedArrayBuffer) của máy người dùng.
  - *Nhược điểm:* Giới hạn trên thiết bị di động yếu, có thể gây nóng máy hoặc giật lag giao diện nếu không đặt trong Worker riêng biệt.
  - *Sử dụng lý tưởng:* Chơi với AI cấp độ 1-10, phân tích nước đi tức thời (Instant Evaluation Bar).

- **Stockfish Server-side UCI Cluster:**
  - *Ưu điểm:* Đồng nhất hiệu năng, kiểm soát hoàn toàn bộ nhớ RAM và depth, phù hợp cho hệ thống phát hiện gian lận (Anti-cheat detection) và tạo báo cáo trận đấu chi tiết sau ván.
  - *Nhược điểm:* Đòi hỏi hạ tầng Cloud có khả năng auto-scale mạnh mẽ (Kubernetes worker pods).`,
    coverImage: 'https://images.unsplash.com/photo-1560174038-da43ac74f01b?auto=format&fit=crop&w=800&q=80',
    tags: ['Stockfish', 'WebAssembly', 'Kiến trúc']
  },
  {
    id: 'art-03',
    title: 'Nghệ Thuật Cờ Tàn: Nguyên Lý Ô Tương Ứng và Tam Giác Hóa',
    category: 'Chiến thuật',
    author: 'WGM Phạm Lê Thảo Nguyên',
    publishDate: '08/03/2026',
    readTime: '7 phút',
    summary: 'Khám phá kỹ thuật điều Vua để ép đối phương vào thế Zugzwang trong tàn cuộc Tốt kinh điển.',
    content: `Nếu khai cuộc quyết định sự khởi đầu, trung cuộc là chiến trường ác liệt, thì cờ tàn chính là nơi biến ưu thế thành điểm số trọn vẹn. 
    
Quy tắc hình vuông của Tốt (Rule of the Square) và kỹ thuật đối vua (Opposition) là hai vũ khí tối thượng mà bất kỳ kỳ thủ nào từ Elo 1500+ cũng phải nắm vững để không bao giờ đánh mất nửa điểm đáng tiếc trong những thế cờ tưởng chừng đơn giản.`,
    coverImage: 'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?auto=format&fit=crop&w=800&q=80',
    tags: ['Cờ tàn', 'Endgame', 'Zugzwang']
  }
];
