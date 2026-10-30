/* =========================================================================
   Jaigurudev Hostel PG & Kitchen — DEMO DATA
   All business constants, image sources and illustrative menu data live here,
   so the owner (or a developer) can update them in one place.
   ========================================================================= */
(function (global) {
  "use strict";

  /* ---------- Business constants (from supplied references) ---------- */
  var BUSINESS = {
    nameEn: "Jaigurudev Hostel PG & Kitchen",
    nameHi: "जय गुरुदेव हॉस्टल पीजी एवं किचन",
    phoneDisplay: "+91 63078 33638",
    phoneTel: "+916307833638",
    whatsapp: "916307833638", // wa.me format, no plus sign
    instagram: "https://www.instagram.com/jgd.hostel.pg/",
    pricePerPlate: 90, // ₹90 per plate — the ONLY price used anywhere
  };

  /* ---------- Image sources ----------------------------------------------
     Royalty-free photographs from Unsplash (Unsplash License). Each was checked
     against its Unsplash page description/tags for vegetarian content.
     They are ILLUSTRATIVE — not photographs of this kitchen's food.
     If a photo fails to load, script.js swaps in the local illustration.
     Replace with the owner's own photographs before going live.
  ------------------------------------------------------------------------- */
  var UNSPLASH = "https://images.unsplash.com/";
  function unsplash(id) {
    return {
      src: function (w) {
        return UNSPLASH + id + "?auto=format&fit=crop&q=70&w=" + (w || 900);
      },
      srcset: function () {
        var self = this;
        return [480, 800, 1200]
          .map(function (w) {
            return self.src(w) + " " + w + "w";
          })
          .join(", ");
      },
    };
  }

  var IMAGES = {
    fallback: "assets/img/thali-illustration.svg",
    thali: Object.assign(unsplash("photo-1711153419402-336ee48f2138"), {
      credit: "fuseviews",
      page: "https://unsplash.com/photos/bKmSUcAGrvI",
      alt: {
        hi: "स्टील की थाली में रोटी, सब्ज़ियाँ और साथ में परोसा गया शाकाहारी भोजन",
        en: "A vegetarian Indian thali with roti and vegetable dishes on a steel plate",
      },
    }),
    rotiCurry: Object.assign(unsplash("photo-1671507136750-05ebd0f97843"), {
      credit: "Karthik B K",
      page: "https://unsplash.com/photos/UVKjwZ6-5-Q",
      alt: {
        hi: "रोटी के साथ शाकाहारी सब्ज़ी की प्लेट",
        en: "A plate of vegetarian curry served with roti",
      },
    }),
    chapati: Object.assign(unsplash("photo-1600935926387-12d9b03066f0"), {
      credit: "Usman Yousaf",
      page: "https://unsplash.com/photos/4GDW-Rt4BVQ",
      alt: {
        hi: "ताज़ी सिकी हुई गेहूँ की रोटी",
        en: "Freshly made wheat chapati",
      },
    }),
    bowls: Object.assign(unsplash("photo-1767114915989-c6ab3c8fc42e"), {
      credit: "Chetanya Sharma",
      page: "https://unsplash.com/photos/aq8v45EwCa0",
      alt: {
        hi: "चावल के साथ दाल और सब्ज़ी की कटोरियाँ",
        en: "Bowls of dal and vegetable curry with rice",
      },
    }),
    riceLegumes: Object.assign(unsplash("photo-1707274860741-1320eda4ef52"), {
      credit: "Unsplash contributor",
      page: "https://unsplash.com/photos/ED9C5fASrBw",
      alt: {
        hi: "चावल के साथ परोसी गई दाल/चने की सब्ज़ी",
        en: "Rice served with a lentil and legume curry",
      },
    }),
  };

  /* ---------- Illustrative catalogue ----------------------------------------
     Meal combinations are taken from the business's own Instagram menu posts.
     They are DEMO examples — not a live, guaranteed daily menu.
     Every plate uses BUSINESS.pricePerPlate (₹90). No other prices exist.
  ------------------------------------------------------------------------- */
  var MEALS = [
    {
      id: "kala-chana-lauki",
      img: "thali",
      pos: "50% 50%",
      cats: ["today", "morning"],
      slot: "morning",
      name: { hi: "काला चना लौकी थाली", en: "Kala Chana & Lauki Thali" },
      short: {
        hi: "काला चना लौकी की मसाला सब्ज़ी, दाल फ्राई और गरम रोटियाँ।",
        en: "Masala kala chana with lauki, dal fry and fresh rotis.",
      },
      items: {
        hi: [
          "5 रोटी",
          "काला चना लौकी की मसाला सब्ज़ी",
          "दाल फ्राई",
          "चावल",
          "सलाद",
          "अचार",
        ],
        en: [
          "5 rotis",
          "Kala chana & lauki masala sabzi",
          "Dal fry",
          "Rice",
          "Salad",
          "Pickle",
        ],
      },
    },
    {
      id: "kohda-kadhi-badi",
      img: "bowls",
      pos: "50% 50%",
      cats: ["today", "evening"],
      slot: "evening",
      name: {
        hi: "कोहड़ा चना व कढ़ी बड़ी थाली",
        en: "Kohda Chana & Kadhi Badi Thali",
      },
      short: {
        hi: "मीठे-तीखे कोहड़ा चना के साथ घर जैसी कढ़ी बड़ी।",
        en: "Pumpkin–chana sabzi with homestyle kadhi badi.",
      },
      items: {
        hi: [
          "5 रोटी",
          "कोहड़ा चना की सब्ज़ी",
          "कढ़ी बड़ी",
          "चावल",
          "सलाद",
          "अचार",
        ],
        en: [
          "5 rotis",
          "Kohda (pumpkin) chana sabzi",
          "Kadhi badi",
          "Rice",
          "Salad",
          "Pickle",
        ],
      },
    },
    {
      id: "aloo-gobhi-matar",
      img: "rotiCurry",
      pos: "50% 55%",
      cats: ["morning"],
      slot: "morning",
      name: { hi: "आलू गोभी मटर थाली", en: "Aloo Gobhi Matar Thali" },
      short: {
        hi: "मौसमी आलू गोभी मटर की मसाला सब्ज़ी और दाल के साथ।",
        en: "Seasonal aloo gobhi matar masala with dal.",
      },
      items: {
        hi: [
          "रोटी",
          "आलू गोभी मटर की मसाला सब्ज़ी",
          "दाल",
          "चावल",
          "सलाद",
          "अचार",
        ],
        en: [
          "Rotis",
          "Aloo gobhi matar masala sabzi",
          "Dal",
          "Rice",
          "Salad",
          "Pickle",
        ],
      },
    },
    {
      id: "kele-kofte",
      img: "riceLegumes",
      pos: "50% 50%",
      cats: ["evening"],
      slot: "evening",
      name: { hi: "केले के कोफ्ते थाली", en: "Kele ke Kofte Thali" },
      short: {
        hi: "कच्चे केले के कोफ्ते की सब्ज़ी, दाल और चावल।",
        en: "Raw-banana kofta curry with dal and rice.",
      },
      items: {
        hi: ["रोटी", "केले के कोफ्ते की सब्ज़ी", "दाल", "चावल", "सलाद", "अचार"],
        en: [
          "Rotis",
          "Raw banana kofta curry",
          "Dal",
          "Rice",
          "Salad",
          "Pickle",
        ],
      },
    },
    {
      id: "litti-chokha",
      img: "chapati",
      pos: "50% 50%",
      cats: ["evening", "special"],
      slot: "evening",
      name: { hi: "लिट्टी चोखा प्लेट", en: "Litti Chokha Plate" },
      short: {
        hi: "फ्राई लिट्टी, आलू-बैंगन-टमाटर का चोखा और चटनी।",
        en: "Fried litti with aloo-baingan-tomato chokha and chutney.",
      },
      items: {
        hi: [
          "5 फ्राई लिट्टी",
          "आलू बैंगन टमाटर का चोखा",
          "चटनी",
          "सलाद",
          "अचार",
        ],
        en: [
          "5 fried litti",
          "Aloo, baingan & tomato chokha",
          "Chutney",
          "Salad",
          "Pickle",
        ],
      },
    },
    {
      id: "aloo-bodha",
      img: "rotiCurry",
      pos: "30% 40%",
      cats: ["morning"],
      slot: "morning",
      name: { hi: "आलू बोड़ा (बरबटी) थाली", en: "Aloo Bodha (Barbati) Thali" },
      short: {
        hi: "आलू बोड़ा / बरबटी की मसाला सब्ज़ी और दाल फ्राई।",
        en: "Aloo with long beans (bodha/barbati) masala and dal fry.",
      },
      items: {
        hi: [
          "5 रोटी",
          "आलू बोड़ा / बरबटी की मसाला सब्ज़ी",
          "दाल फ्राई",
          "चावल",
          "सलाद",
          "अचार",
        ],
        en: [
          "5 rotis",
          "Aloo & long-bean masala sabzi",
          "Dal fry",
          "Rice",
          "Salad",
          "Pickle",
        ],
      },
    },
  ];

  /* Today's demo menu — which catalogue meal is featured in each tab. */
  var TODAY = { morning: "kala-chana-lauki", evening: "kohda-kadhi-badi" };

  var CATEGORIES = ["all", "today", "morning", "evening", "special"];

  var OCCASIONS = [
    { key: "pooja", icon: "flower2" },
    { key: "birthday", icon: "cake2" },
    { key: "mundan", icon: "scissors" },
    { key: "annaprashan", icon: "cup-hot" },
    { key: "namkaran", icon: "journal-richtext" },
    { key: "wedding", icon: "hearts" },
    { key: "kitty", icon: "people-fill" },
    { key: "grihapravesh", icon: "house-heart" },
    { key: "family", icon: "balloon-heart" },
  ];

  global.JGD_DATA = {
    BUSINESS: BUSINESS,
    IMAGES: IMAGES,
    MEALS: MEALS,
    TODAY: TODAY,
    CATEGORIES: CATEGORIES,
    OCCASIONS: OCCASIONS,
  };
})(window);
