// =========================================================
// 設定ファイル：項目を追加・変更・削除する場合はここだけ編集
// =========================================================
//
// Googleフォームの実際の項目：
//   日付 / 月度 / 週度 / 種別 / カテゴリ / 費目 / おさいふ / 金額 / メモ
//
// 各シートで使わない項目は fields に書かなければOK（空送信になる）
// =========================================================

const CONFIG = {
  // 全シート共通の送信先
  // 編集URL https://docs.google.com/forms/d/e/●●●/viewform の ●●● を差し替え
  action: 'https://docs.google.com/forms/d/e/1FAIpQLSc2wP6nKtexr11OOrRTfkfSlmt13ejwFx3jsvWxy7lCgm6-Ew/formResponse',


  forms: [
    // -----------------------------------------------------
    // 収支登録
    // -----------------------------------------------------
    {
      id: 'transaction',
      label: '収支',
      icon: 'minus',
      title: '収支を登録',
      subtitle: '日々の入出金',
      submitLabel: '登録',
      fields: [
        { name: 'date', label: '日付', type: 'date',
          entry: 'entry.1754312861', required: true, default: 'today' },

        // 種別を切り替えると、下の「カテゴリ」と「おさいふ」が変わる
        { name: 'type', label: '種別', type: 'radio',
          entry: 'entry.104175700', required: true,
          options: ['支出', '収入'], default: '支出' },

        // カテゴリ：種別ごとに選択肢を切り替え
        {
          name: 'category',
          label: 'カテゴリ',
          type: 'select',
          entry: 'entry.1670717952',
          required: true,
          dependsOn: {
            field: 'type',
            optionsMap: {
              '支出': ['固定費', '通勤費', 'スーパー代', '特別費'],
              '収入': ['給与', '賞与', '副業', '臨時収入'],
            },
          },
        },

        // おさいふ：種別ごとにラベルを切り替え
        {
          name: 'wallet',
          type: 'select',
          entry: 'entry.164562765',
          required: true,
          options: ['楽天カード', '現金', 'ICOCA(スマホ)', 'ICOCA(カード)', 'PayPay', '楽天銀行', 'dNEOBANK', '特別費口座', '楽天証券', 'iDeCo'],
          dependsOn: {
            field: 'type',
            labelMap: { '支出': '出金元', '収入': '入金先' },
          },
        },

        { name: 'amount', label: '金額', type: 'number',
          entry: 'entry.1976713429', required: true, prefix: '¥', placeholder: '0' },

        { name: 'memo', label: 'メモ', type: 'textarea',
          entry: 'entry.283245123', placeholder: '任意' },
      ],
    },

    // -----------------------------------------------------
    // 振替登録（2件送信モード）
    // -----------------------------------------------------
    {
      id: 'transfer',
      label: '振替',
      icon: 'swap',
      title: '振替を登録',
      subtitle: '口座間の移動',
      submitLabel: '登録',
      submitMode: 'split',

      fields: [
        { name: 'date', label: '日付', type: 'date',
          required: true, default: 'today' },

        { name: 'walletFrom', label: '出金元', type: 'select',
          required: true,
          options: ['楽天カード', '現金', 'ICOCA(スマホ)', 'ICOCA(カード)', 'PayPay', '楽天銀行', 'dNEOBANK', '特別費口座', '楽天証券', 'iDeCo'] },

        { name: 'walletTo', label: '入金先', type: 'select',
          required: true,
          options: ['楽天カード', '現金', 'ICOCA(スマホ)', 'ICOCA(カード)', 'PayPay', '楽天銀行', 'dNEOBANK', '特別費口座', '楽天証券', 'iDeCo'] },

        { name: 'amount', label: '金額', type: 'number',
          required: true, prefix: '¥', placeholder: '0' },

        { name: 'memo', label: 'メモ', type: 'textarea', placeholder: '任意' },
      ],

      // 入力値から送信するpayload配列を返す
      // 種別="振替" 固定。出金元はマイナス値、入金先はプラス値
      splitPayloads: (v) => {
        const common = {
          'entry.375635195': v.date,
          'entry.104175700': '振替',
          'entry.283245123': v.memo || '',
        };
        return [
          { ...common, 'entry.164562765': v.walletFrom, 'entry.283245123': '-' + v.amount },
          { ...common, 'entry.1497529552': v.walletTo,   'entry.283245123': v.amount },
        ];
      },
    },

    // -----------------------------------------------------
    // 予算登録
    // -----------------------------------------------------
    {
      id: 'budget',
      label: '予算',
      icon: 'wallet',
      title: '予算を登録',
      subtitle: '月度・週度の予算',
      submitLabel: '登録',
      fields: [
        { name: 'month', label: '月度', type: 'text',
          entry: 'entry.1610250577', placeholder: '例：2026年5月度' },

        { name: 'week', label: '週度', type: 'select',
          entry: 'entry.1609471946',
          options: ['', '1週目', '2週目', '3週目', '4週目', '5週目'] },

        { name: 'category', label: 'カテゴリ', type: 'select',
          entry: 'entry.1670717952', required: true,
          options: ['固定費', '通勤費', 'スーパー代', '特別費'] },

        { name: 'item', label: '費目', type: 'text',
          entry: 'entry.497073049', placeholder: '例：家賃' },

        { name: 'amount', label: '金額', type: 'number',
          entry: 'entry.1976713429', required: true, prefix: '¥', placeholder: '0' },
      ],
    },
  ],
};

// アイコン
const ICONS = {
  minus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  plus:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  swap:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M16 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>',
};
