// ── Static asset URLs & UI constants ────────────────────────────────
// Extracted from mockData.ts so components can reference these
// without importing the mock data layer.

export const ASSET_IMAGES = {
  logo: 'https://lh3.googleusercontent.com/aida/AEtjO1XNHuOK0IDXVtTq8B5nIu1wXxQvLOJaxkulYlQTbfw_Esj4-21JZOHDdQ5rPQiP2TQSKZEaMoI3k-DV9iXufa2CNqwTAPZHSf_t06pen_8ftAP6tXcIcnxW09-dJJ-DFQPH5-qlS9lX77EF97p3n2vSfe9uEyQVlu1tN3rLu9waJ8apNI83F-8fZnrsqq-CDZ1CuhVBE3jo-lTKrfCpw8aDE_-A2gefC3wVGDvBfLIuD9xJQgIG2Zcp7g',
  profile: 'https://lh3.googleusercontent.com/aida/AEtjO1UYy8Rshw_jSZFs6EbKz9F9trtgcukHj8pSQDUH1J8A_GJxF0rMfT6HOsElvKdi9enEp1LK_dXVyMyF5nD8blGk_Pi-7WWyITfyKye6d-3N8NnO2g2GgbaD1D_RwgLr6H35wB_WAx_YMaVRkeQ-QS9xBXT7CB8wt1UtSHiHmEs-__sSf1tenp199Ta-kqADYjpB5wcqM9WtYEzVugbwvmlKg0sDTEbRqiypzn1uiQuil03uh26loN1zetk',
  map: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_jpQcN2NwDLc-Qyci0XHC1G-AiDcudxlv2so7KmYvZiL-VK25lGWIkjL6mJXKVlaQy0uPpNHSE46P7SYk7Cryypc2Z7uhXXKjhJR-RoThXZC2WyBWfezl_BCLgl3IihDYz141GemDLAWzBZtn5FJwpKGJKJBlNJED_YEg8Q2l6A0AcrJ2h-piEA3Y2pYjAzB-Ik5beFy8K2wCuDlP8eJSClWWeIYfVq7nipH6qHuOi5PPq4QWikPA',
  metroHealth: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAmvg77nCeypeBGTnF-R24J-zCrC9BpkolwUYg-cg20u78rtf4fHO0ShaaKfpPBBhpW8LasoUbkwu-WVNnFGqbAZmaEa2m9cJz0i1Oo0q3a89pjBeQQ2PJOq0lOAAeql8LUW2vCLMf9ZP1BCGU_P-T5JMeUQSGLcvo-fAYXdQ7VeqTpAKNo6dKABV8r4w70rcDf5j-HT75QVNBoetFahGp7jLkiGsS6ASsAr2IL6bQwUmWGyUDL3VJ',
  apexCare: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSyBoU-LS8XOsFVinuGmcjx48hh85BQ12rRzFF3EjMxsZooP-s4z1QNEaA_IMLfEzpF0S2nbgwN-9S8OEwjwfZmZQ2OoBy1mQepInVQzrjFvyNgwdaOCTbz8gVzbNlx-RoVvKuxwkp48yc8RQxHfxCi5T4YU_Ol8vqvyMX6Up4Vyewl_KBgzauRsB3VPtcG5hOgl8hgb3mHFn_7T0P_7oVMfO_SY3itp2EKKPZ05HQElWUgQs9fxBZ',
  walgreens: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrvOS5YIhfJ1DmT_ByxKxP9frLltQBvcV2Ka5BMWgRDV8i_8ItLGEt9w-q7YHs2Wg66lLKHa38Cvqgy68MhUIqke3BRnOkL7njsTK6eP5b5pD0pmkddW7sFzFCwNPvPDCn8Vqa0dRShJ4cPlyemwX5Y_7_8fVn5UeFPrfyXobO7JL330nCvhKhws213g_1aNjaAqPM7QzLUCDn23xCRuAjJNUY-IlEiIG0vhFaZhTxXCSdJPLQZwtp',
  atorvastatinPill: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDujvJ0ygqJMJ-AD-PhrFC77qmo6b-ereIS87kJvBLyYvAQFL2KosuRHr29J2yY3r2AOjV-fYJ3JDd7OWrpLS8ijht3c8ph8ZqKVXsmK5A3fwBMivdWviMQk5mWvKTvFUU6Irksb_JOiMYvSuhnL6_J5W_tFijio1YZtx67hHSLzuauyNnEJeslPx-pqfEDKk8B6ZBiXjJZuNxDJiUMj4FjJjt3GC4mR6l4RiqEBFlA34Fkz6Ytb-53',
  metforminPill: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8_bTX0jJK_8lape_u0-aAqCPJIstPEjb72n_kj1ISFKS3iNQuO8I8JWJNtyYSPW4HF6fhI3yd7NRJ74L7JP_ICs7GvBd_4D3aollFzGuQKaiAPgkWdIWAEQLNjV3HOEEwU-weGIT4Gp7dgpxoBr5HuXVqaX1aXHoYlrpM5m72kv7Bi324ZVpQb17yS9M4lISafXUSQSKhep2GeruwWDYFt9DW40XpU5tOWQnA2jmVP1ZQtbO17l3H',
  sertralinePill: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTntr41qpBWB7XObm6dXSrTbmXsP4CvBo2G76T3hGg5_26fh6e6iaC6Rt5cDBrBjfZwhiD3tUD0rqSziqswSwMxT6j5PbvzeevcOl85YoWDSVNPmbepbSBRslCFzRwmRWXdvmPVQhsifKV5sK3qrdlWmlJCC6VnFG65SSqWzD1IJ-zcKLCD0LFd6u4QT6rylKZRj7qzYffcIVh2WbRczboXt6ufy8nlKT9KH-bzrvAmsj8kOm_slJT',
};

export const PRESCRIBER_QUESTIONS = [
  {
    id: 'q1',
    display: '"Can you authorize generic Atorvastatin 20mg substitution instead of Lipitor?"',
    fullText: 'Can you prescribe generic Atorvastatin 20mg substitution instead of Lipitor to reduce my out-of-pocket pharmacy cost?',
  },
  {
    id: 'q2',
    display: '"Is this order marked \'May Substitute\' for AB-equivalent generics?"',
    fullText: 'Does my prescription permit an AB-rated therapeutically equivalent generic under State substitution laws?',
  },
  {
    id: 'q3',
    display: '"Can we submit a 90-day fill instead of 30 days for tier savings?"',
    fullText: 'Can we submit a 90-day maintenance supply to maximize local pharmacy volume savings?',
  },
];
