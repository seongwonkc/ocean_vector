'use strict';

// ocean_vector/diagnostic/QUESTION_SET.js
//
// The 30-question diagnostic set for VECTOR Feature 3.
// Ordered as approved: RW items 1-12, Math items 13-30.
//
// Three SPR swaps applied (approved 2026-04-30):
//   alg_e_010  → alg_e_005  (row 13: simpler linear-equation word problem)
//   alg_h_001  → alg_h_007  (row 17: broken equation data; swap to cleaner hard item)
//   mt02-m1-22 → mt03-m1-22 (row 23: same trig ratio question, clean data copy)
//
// Source approval: DIAGNOSTIC_QUESTION_SET_CANDIDATES.md v4, eoi_t_043
// adjudicated as correct by Kevin (see adjudication note in that doc).

window.VECTOR_QUESTION_SET = [
  // --- Reading & Writing (12) ---
  // Craft & Structure
  'cs_c_029',   //  1  RW · medium · cs_main_purpose
  'cs_c_207',   //  2  RW · hard   · cs_cross_text (Rawls vs. Nozick)
  'cs_c_209',   //  3  RW · hard   · cs_cross_text (Dehaene vs. Tononi)
  'cs_c_146',   //  4  RW · medium · cs_cross_text (Dawkins / Sperber)
  // Information & Ideas
  'ii_c_001',   //  5  RW · easy   · ii_central_ideas (bioluminescence)
  'ii_c_192',   //  6  RW · easy   · ii_coe_q (soil pH / tomato table)
  'ii_c_031',   //  7  RW · hard   · ii_coe_q (quantitative long passage)
  'ii_c_025',   //  8  RW · medium · ii_coe_q (wolf reintroduction)
  // Standard English Conventions
  'sec_f_001',  //  9  RW · easy   · sec_form_structure
  'sec_b_018',  // 10  RW · hard   · sec_boundaries
  // Expression of Ideas
  'eoi_s_001',  // 11  RW · easy   · eoi_synthesis (notes format)
  'eoi_t_043',  // 12  RW · hard   · eoi_transition

  // --- Math (18) ---
  // Algebra
  'alg_e_005',  // 13  Math · easy   · linear_eq (SPR from alg_e_010)
  'alg_e_009',  // 14  Math · easy   · linear_func_interp
  'alg_m_007',  // 15  Math · medium · factor_polynomial
  'mt03-m1-01', // 16  Math · medium · linear_equation (y-intercept of graph)
  'alg_h_007',  // 17  Math · hard   · sum_of_solutions (SPR from alg_h_001)
  // Advanced Math
  'adv_e_003',  // 18  Math · easy   · exponent_rules
  'adv_e_005',  // 19  Math · easy   · quad_eq
  'adv_m_005',  // 20  Math · medium · discriminant_count
  'adv_h_001',  // 21  Math · hard   · polynomial_factor
  // Geometry
  'mt01-m1-08', // 22  Math · medium · geometry (triangle angle, LaTeX passage)
  'mt03-m1-22', // 23  Math · medium · trigonometry  (SPR from mt02-m1-22)
  'mt03-m1-03', // 24  Math · medium · geometry (scale factor → area)
  'mt01-m2h-11',// 25  Math · hard   · geometry (coordinate circle)
  'mt03-m2h-06',// 26  Math · hard   · geometry (combined circle area)
  // PSDA
  'mt03-m1-02', // 27  Math · medium · probability (rock classification table)
  'mt01-m1-22', // 28  Math · medium · ratio_percent (80% greater / 60% less)
  'mt02-m1-07', // 29  Math · medium · statistics (40-employee survey)
  'mt01-m2h-13',// 30  Math · hard   · statistics (min score for target mean)
];
