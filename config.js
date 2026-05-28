// =========================================================
// 設定ファイル：項目を追加・変更・削除する場合はここだけ編集
// =========================================================
//
// Googleフォームの実際の項目：
//   日付 / 種別 / カテゴリ / おさいふ / 金額 / メモ
//
// 各シートで使わない項目は fields に書かなければOK（空送信になる）
// =========================================================

const CONFIG = {
  // 全シート共通の送信先
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
          entry: 'entry.933151050', required: true,
          options: ['支出', '収入'], default: '支出' },

        // カテゴリ：種別ごとに選択肢を切り替え
        {
          name: 'category',
          label: 'カテゴリ',
          type: 'select',
          entry: 'entry.1548661037',
          required: true,
          dependsOn: {
            field: 'type',
            optionsMap: {
              '支出': ['固定費', '通勤費', 'スーパー代', '特別費'],
              '収入': ['給与', '賞与', '副業', '臨時収入'],
            },
          },
        },

        // おさいふ：種別ごとにラベルだけ切り替え（送信先entryは共通）
        {
          name: 'wallet',
          type: 'select',
          entry: 'entry.341017103',
          required: true,
          options: ['楽天カード', '現金', 'ICOCA(スマホ)', 'ICOCA(カード)', 'PayPay',
                    '楽天銀行', 'dNEOBANK', '特別費口座', '楽天証券', 'iDeCo'],
          dependsOn: {
            field: 'type',
            labelMap: {
              '支出': '出金元',
              '収入': '入金先',
            },
          },
        },

        { name: 'amount', label: '金額', type: 'number',
          entry: 'entry.2072083293', required: true, prefix: '¥', placeholder: '0' },

        { name: 'memo', label: 'メモ', type: 'textarea',
          entry: 'entry.137918229', placeholder: '任意' },
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
          options: ['楽天カード', '現金', 'ICOCA(スマホ)', 'ICOCA(カード)', 'PayPay',
                    '楽天銀行', 'dNEOBANK', '特別費口座', '楽天証券', 'iDeCo'] },

        { name: 'walletTo', label: '入金先', type: 'select',
          required: true,
          options: ['楽天カード', '現金', 'ICOCA(スマホ)', 'ICOCA(カード)', 'PayPay',
                    '楽天銀行', 'dNEOBANK', '特別費口座', '楽天証券', 'iDeCo'] },

        { name: 'amount', label: '金額', type: 'number',
          required: true, prefix: '¥', placeholder: '0' },

        { name: 'memo', label: 'メモ', type: 'textarea', placeholder: '任意' },
      ],

      // 入力値から送信するpayload配列を返す
      // 種別="振替" 固定。出金元はマイナス値、入金先はプラス値
      // おさいふ(entry.341017103)に2回インプットする
      splitPayloads: (v) => {
        const common = {
          'entry.1754312861': v.date,
          'entry.933151050': '振替',
          'entry.137918229': v.memo || '',
        };
        return [
          // 1件目：出金元 → マイナス
          { ...common,
            'entry.341017103': v.walletFrom,
            'entry.2072083293': '-' + v.amount },
          // 2件目：入金先 → プラス
          { ...common,
            'entry.341017103': v.walletTo,
            'entry.2072083293': v.amount },
        ];
      },
    },
  ],
};

// アイコン
const ICONS = {
  minus:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  plus:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  swap:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>',
};