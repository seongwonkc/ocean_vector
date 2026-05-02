'use strict';

// ocean_vector/js/renderQuestion.js
//
// Renders question content from Supabase rows into DOM containers.
// CSS classes match css/styles-bluebook.css exactly.
//
// Usage:
//   VectorRender.renderPassage(row, passageEl)
//     — fills the left panel with passage text (or clears it)
//   VectorRender.renderStemAndChoices(row, containerEl, opts)
//     — fills the right panel with q-num, stem, and choices
//   VectorRender.renderMath(row, containerEl, opts)
//     — single-column render for math questions (no passage panel)
//
// KaTeX is loaded deferred; if not yet available, schedules a re-render
// after a short delay.

(function () {
  'use strict';

  // The "[Text 2]\n" delimiter pattern was introduced during DanielLab →
  // Supabase seeding. See the v4 dual-text integrity check in
  // docs/DIAGNOSTIC_QUESTION_SET_CANDIDATES.md (Revision Item 4) for the
  // verification record.
  var DUAL_TEXT_DELIMITER = '\n\n[Text 2]\n';

  // ── Table helpers (ported from DanielLab Item 5) ─────────────────────────

  // Parses pipe-delimited plain text into a styled HTML table.
  // First row → <thead>; remaining rows → <tbody>.
  // Separator lines (|---|, ---) are stripped. Falls back to a plain
  // paragraph if fewer than 2 content rows are detected.
  function parseTextTable(text) {
    var lines = text.trim().split('\n').filter(function (l) {
      return l.trim() && !l.match(/^[-|:\s]+$/);
    });
    if (lines.length < 2) return '<p style="font-size:14px;">' + text + '</p>';
    var rows = lines.map(function (l) {
      return l.split('|').map(function (c) { return c.trim(); }).filter(function (c) { return c !== ''; });
    });
    var header = rows[0];
    var body   = rows.slice(1);
    return '<table class="bb-data-table">' +
      '<thead><tr>' + header.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + body.map(function (r) {
        return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody>' +
    '</table>';
  }

  // Detect a data table: passage contains "|" on multiple lines.
  function looksLikeTable(text) {
    if (!text) return false;
    var lines = text.split('\n').filter(function (l) { return l.indexOf('|') !== -1; });
    return lines.length >= 2;
  }

  // ── Passage helpers ──────────────────────────────────────────────────────

  function buildPassageHtml(passage, graphField) {
    // Graph SVG: log and skip (graph field not seeded in Supabase; guard for
    // defense in depth if a row ever includes it in the future).
    if (graphField) {
      console.log('[VectorRender] graph field present but not rendered (not seeded in Supabase)');
    }

    if (!passage || !passage.trim()) return '';

    // Data table: pipe-delimited multi-line content
    if (looksLikeTable(passage)) {
      return parseTextTable(passage);
    }

    // Dual-text: two passages concatenated during DanielLab → Supabase seeding
    var idx = passage.indexOf(DUAL_TEXT_DELIMITER);
    if (idx !== -1) {
      var text1 = passage.substring(0, idx);
      var text2 = passage.substring(idx + DUAL_TEXT_DELIMITER.length);
      return (
        '<div class="bb-dual-wrap">' +
          '<div class="bb-text-block">' +
            '<div class="bb-text-label">Text 1</div>' +
            '<div class="bb-passage">' + text1 + '</div>' +
          '</div>' +
          '<div class="bb-text-block">' +
            '<div class="bb-text-label">Text 2</div>' +
            '<div class="bb-passage">' + text2 + '</div>' +
          '</div>' +
        '</div>'
      );
    }

    // Single passage (or LaTeX figure description for math)
    return '<div class="bb-passage">' + passage + '</div>';
  }

  // ── Choice helpers ───────────────────────────────────────────────────────

  function buildChoicesHtml(row, selectedKey) {
    // Reject SPR questions explicitly OR when MCQ choices are missing.
    // The explicit is_spr check is defense in depth: prevents a future SPR
    // row that has answer_a populated by mistake from rendering incorrectly.
    var hasChoices = row.answer_a != null || row.answer_b != null ||
                     row.answer_c != null || row.answer_d != null;
    if (row.is_spr === true || !hasChoices) {
      throw new Error('Question type not supported: SPR (question_id=' + row.question_id + ')');
    }
    var keys = ['A', 'B', 'C', 'D'];
    var texts = { A: row.answer_a, B: row.answer_b, C: row.answer_c, D: row.answer_d };
    var html = '<div class="bb-choices">';
    keys.forEach(function (key) {
      var sel = selectedKey === key ? ' selected' : '';
      html += (
        '<label class="bb-choice' + sel + '" data-key="' + key + '">' +
          '<span class="bb-choice-circle">' + key + '</span>' +
          '<span class="bb-choice-text">' + (texts[key] || '') + '</span>' +
          '<input type="radio" name="bb-answer" value="' + key + '"' +
            (selectedKey === key ? ' checked' : '') + ' style="display:none">' +
        '</label>'
      );
    });
    html += '</div>';
    return html;
  }

  // ── KaTeX ────────────────────────────────────────────────────────────────

  function tryRenderKaTeX(el) {
    if (typeof window.renderMathInElement === 'function') {
      try {
        window.renderMathInElement(el, {
          delimiters: [
            { left: '$$', right: '$$', display: true  },
            { left: '$',  right: '$',  display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true  },
          ],
          throwOnError: false,
        });
      } catch (e) {
        console.warn('[VectorRender] KaTeX error:', e);
      }
    } else {
      // Deferred KaTeX not yet ready; retry once after 200ms
      setTimeout(function () { tryRenderKaTeX(el); }, 200);
    }
  }

  // ── Choice interaction ───────────────────────────────────────────────────

  function wireChoices(containerEl, onAnswer) {
    var labels = containerEl.querySelectorAll('.bb-choice');
    labels.forEach(function (label) {
      label.addEventListener('click', function () {
        labels.forEach(function (l) {
          l.classList.remove('selected');
          var r = l.querySelector('input[type=radio]');
          if (r) r.checked = false;
        });
        label.classList.add('selected');
        var radio = label.querySelector('input[type=radio]');
        if (radio) radio.checked = true;
        if (typeof onAnswer === 'function') onAnswer(label.dataset.key);
      });
    });
  }

  // ── Public API ───────────────────────────────────────────────────────────

  window.VectorRender = {

    // Render passage into left panel element.
    // Clears the element if no passage.
    renderPassage: function (row, passageEl) {
      passageEl.innerHTML = buildPassageHtml(row.passage || '', row.graph || null);
      tryRenderKaTeX(passageEl);
    },

    // Render question number, stem, and choices into containerEl.
    // opts: { position, total, selectedAnswer, onAnswer }
    renderStemAndChoices: function (row, containerEl, opts) {
      opts = opts || {};
      var position = opts.position || 1;
      var total    = opts.total    || 30;
      var selected = opts.selectedAnswer || null;

      containerEl.innerHTML = (
        '<div class="bb-q-num">Question ' + position +
          ' <span style="font-weight:400;color:var(--text-dim)">of ' + total + '</span></div>' +
        '<div class="bb-question-stem">' + (row.question_text || '') + '</div>' +
        buildChoicesHtml(row, selected)
      );

      tryRenderKaTeX(containerEl);
      wireChoices(containerEl, opts.onAnswer);
    },

    // Single-column render for math questions (no passage panel).
    // opts: same as renderStemAndChoices
    renderMath: function (row, containerEl, opts) {
      opts = opts || {};
      var position = opts.position || 1;
      var total    = opts.total    || 30;
      var selected = opts.selectedAnswer || null;
      var passage  = row.passage || '';

      // Math passages: pipe-delimited data tables route through parseTextTable
      // (same as RW passages); all other math passages render in bb-math-stem.
      var passageBlock = '';
      if (passage.trim()) {
        passageBlock = looksLikeTable(passage)
          ? parseTextTable(passage)
          : '<div class="bb-math-stem">' + passage + '</div>';
      }

      containerEl.innerHTML = (
        '<div class="bb-q-num">Question ' + position +
          ' <span style="font-weight:400;color:var(--text-dim)">of ' + total + '</span></div>' +
        passageBlock +
        '<div class="bb-question-stem">' + (row.question_text || '') + '</div>' +
        buildChoicesHtml(row, selected)
      );

      tryRenderKaTeX(containerEl);
      wireChoices(containerEl, opts.onAnswer);
    },

  };

}());
  