const STORAGE_KEY = "telugu_family_tree_data_v31";
const FOCUS_KEY = "telugu_family_tree_focus_v31";

const MALE_ICON = `<svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>`;
const FEMALE_ICON = `<svg viewBox="0 0 24 24"><path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.9 1.2 3.5 2.8 4.2C7 11.5 4 14.2 4 18v2h16v-2c0-3.8-3-6.5-6.3-7.3 1.6-.7 2.8-2.3 2.8-4.2A4.5 4.5 0 0 0 12 2zm0 2c1.4 0 2.5 1.1 2.5 2.5S13.4 9 12 9s-2.5-1.1-2.5-2.5S10.6 4 12 4z"/></svg>`;

const DEFAULT_FAMILY = [
  { id: "1", name: "laxman", gender: "male", dob: "1962-01-01", spouseId: "2", anniversary: "1985-05-18", parentIds: ["1788499824606", "1788499832236"] },
  { id: "2", name: "kalavathi", gender: "female", dob: "1970-01-01", spouseId: "1", anniversary: "1985-05-18", parentIds: ["1788499796499"] },
  { id: "1788499738062", name: "arjun", gender: "male", dob: "1986-01-01", spouseId: "1788499767902", anniversary: null, parentIds: ["1", "2"] },
  { id: "1788499744418", name: "arun", gender: "male", dob: "1994-01-01", spouseId: null, anniversary: null, parentIds: ["1", "2"] },
  { id: "1788499753179", name: "aravind", gender: "male", dob: "1996-01-01", spouseId: null, anniversary: null, parentIds: ["1", "2"] },
  { id: "1788499767902", name: "navya", gender: "female", dob: "1994-01-01", spouseId: "1788499738062", anniversary: null, parentIds: ["1788530252033"] },
  { id: "1788499776564", name: "veda", gender: "female", dob: "2018-01-01", spouseId: null, anniversary: null, parentIds: ["1788499738062", "1788499767902"] },
  { id: "1788499784981", name: "jr veda", gender: "female", dob: "2026-01-01", spouseId: null, anniversary: null, parentIds: ["1788499738062", "1788499767902"] },
  { id: "1788499796499", name: "lakshmi", gender: "female", dob: null, spouseId: "1788503137601", anniversary: null, parentIds: [] },
  { id: "1788499824606", name: "Narasaiah", gender: "male", dob: null, spouseId: "1788499832236", anniversary: null, parentIds: [] },
  { id: "1788499832236", name: "Ratnavva", gender: "female", dob: null, spouseId: "1788499824606", anniversary: null, parentIds: [] },
  { id: "1788499964158", name: "malliswari", gender: "female", dob: "1976-01-01", spouseId: "1788500027227", anniversary: null, parentIds: ["1788499796499"] },
  { id: "1788500027227", name: "Srinivas", gender: "male", dob: "1972-01-01", spouseId: "1788499964158", anniversary: null, parentIds: [] },
  { id: "1788501001590", name: "Geetha", gender: "female", dob: "1981-01-01", spouseId: "1788501015143", anniversary: null, parentIds: ["1788499796499"] },
  { id: "1788501015143", name: "Raju", gender: "male", dob: "1977-01-01", spouseId: "1788501001590", anniversary: null, parentIds: [] },
  { id: "1788501031856", name: "Harini", gender: "female", dob: "2016-01-01", spouseId: null, anniversary: null, parentIds: ["1788501015143", "1788501001590"] },
  { id: "1788501127880", name: "Ashok", gender: "male", dob: null, spouseId: "1788501143419", anniversary: null, parentIds: ["1788499796499"] },
  { id: "1788501143419", name: "Vasantha", gender: "female", dob: "1977-01-01", spouseId: "1788501127880", anniversary: null, parentIds: [] },
  { id: "1788501162260", name: "Sagar", gender: "male", dob: "1992-01-01", spouseId: null, anniversary: null, parentIds: ["1788501127880", "1788501143419"] },
  { id: "1788501182997", name: "Manasa", gender: "female", dob: "1994-01-01", spouseId: null, anniversary: null, parentIds: ["1788501127880", "1788501143419"] },
  { id: "1788501209163", name: "Rachana", gender: "female", dob: "1998-01-01", spouseId: null, anniversary: null, parentIds: ["1788501127880", "1788501143419"] },
  { id: "1788503137601", name: "mallaiah", gender: "male", dob: null, spouseId: "1788499796499", anniversary: null, parentIds: [] },
  { id: "1788530252033", name: "Bhumeshwar", gender: "male", dob: "1970-01-01", spouseId: "1788530281445", anniversary: null, parentIds: [] },
  { id: "1788530252133", name: "ammulu", gender: "female", dob: "2003-01-01", spouseId: null, anniversary: null, parentIds: ["1788530252033"] },
  { id: "1788530281445", name: "laxmi", gender: "female", dob: "1977-01-01", spouseId: "1788530252033", anniversary: null, parentIds: [] }
];

let family = [];
let focusPersonId = "";
let memberById = new Map();
let parentsCache = new Map();
let kinshipCache = new Map();
let lastLayout = null;
let viewport, svg, container, nodesLayer, zoom;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function rebuildIndexes() {
  memberById = new Map(family.map((m) => [m.id, m]));
  parentsCache = new Map();
  kinshipCache = new Map();
}

function getMember(id) {
  return memberById.get(id);
}

function looksLikeMinimalFallback(arr) {
  if (!Array.isArray(arr) || arr.length !== 2) return false;
  const ids = arr.map((m) => m.id).sort().join(",");
  return ids === "1,2";
}

async function initializeApp() {
  if (typeof d3 === "undefined") {
    const screen = document.getElementById("loadingScreen");
    if (screen) screen.innerHTML = "<p>Could not load the tree library (d3.min.js).</p>";
    return;
  }

  setupCanvas();

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0 && !looksLikeMinimalFallback(parsed)) {
        family = parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (family.length === 0) {
    family = DEFAULT_FAMILY.map((m) => ({ ...m, parentIds: [...(m.parentIds || [])] }));
    try {
      const res = await fetch("family_data.json", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > family.length) {
          family = data;
        }
      }
    } catch (e) {
      // Embedded default is enough when opened as a file or offline.
    }
  }

  rebuildIndexes();

  const savedFocus = localStorage.getItem(FOCUS_KEY);
  if (savedFocus && getMember(savedFocus)) {
    focusPersonId = savedFocus;
  } else {
    const arjun = family.find((m) => m.name.toLowerCase() === "arjun");
    focusPersonId = arjun ? arjun.id : (family[0]?.id || "1");
  }

  persistFamilyData();
  updateHeaderInputs();
  renderTree();
  requestAnimationFrame(() => resetZoom(false));
  hideLoading();
}

function hideLoading() {
  const screen = document.getElementById("loadingScreen");
  if (screen) screen.classList.add("hidden");
}

function persistFamilyData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(family));
  localStorage.setItem(FOCUS_KEY, focusPersonId);
}

function exportFamilyJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(family, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "family_tree_backup.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importFamilyJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported) && imported.length > 0) {
        family = imported;
        rebuildIndexes();
        focusPersonId = family[0].id;
        persistFamilyData();
        renderTree();
        updateHeaderInputs();
        resetZoom();
        alert(`Loaded ${family.length} relatives successfully!`);
      }
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

const isOlder = (p1, p2) => {
  if (!p1 || !p2 || !p1.dob || !p2.dob) return false;
  return new Date(p1.dob) < new Date(p2.dob);
};

function getAllParents(person) {
  if (!person) return [];
  if (parentsCache.has(person.id)) return parentsCache.get(person.id);
  const pSet = new Set(person.parentIds || []);
  (person.parentIds || []).forEach((pId) => {
    const parent = getMember(pId);
    if (parent && parent.spouseId) pSet.add(parent.spouseId);
  });
  const result = Array.from(pSet).map((id) => getMember(id)).filter(Boolean);
  parentsCache.set(person.id, result);
  return result;
}

const areSiblings = (p1, p2) => {
  if (!p1 || !p2 || p1.id === p2.id) return false;
  const p1Parents = getAllParents(p1).map((p) => p.id);
  const p2Parents = getAllParents(p2).map((p) => p.id);
  return p1Parents.some((id) => p2Parents.includes(id));
};

function getDirectKinshipRole(pA, pB) {
  if (!pA || !pB || pA.id === pB.id) return null;
  if (pA.spouseId === pB.id) return { role: "SPOUSE", isBio: true };

  const aParents = getAllParents(pA);
  const bParents = getAllParents(pB);

  if (aParents.some((p) => p.id === pB.id)) {
    return { role: pB.gender === "male" ? "FATHER" : "MOTHER", isBio: true };
  }
  if (bParents.some((p) => p.id === pA.id || (pA.spouseId && p.id === pA.spouseId))) {
    return { role: pB.gender === "male" ? "SON" : "DAUGHTER", isBio: (pB.parentIds || []).includes(pA.id) };
  }
  if (areSiblings(pA, pB)) {
    return { role: pB.gender === "male" ? "BROTHER" : "SISTER", isBio: true };
  }

  const aFather = aParents.find((p) => p.gender === "male");
  const aMother = aParents.find((p) => p.gender === "female");

  if (aFather && getAllParents(aFather).some((p) => p.id === pB.id)) {
    return { role: pB.gender === "male" ? "PATERNAL_GRANDFATHER" : "PATERNAL_GRANDMOTHER", isBio: true };
  }
  if (aMother && getAllParents(aMother).some((p) => p.id === pB.id)) {
    return { role: pB.gender === "male" ? "MATERNAL_GRANDFATHER" : "MATERNAL_GRANDMOTHER", isBio: true };
  }

  if (aFather && areSiblings(aFather, pB)) {
    return { role: pB.gender === "male" ? (isOlder(pB, aFather) ? "PEDDANANNA" : "BABAI") : "MENATTHA", isBio: false };
  }
  if (aMother && areSiblings(aMother, pB)) {
    return { role: pB.gender === "male" ? "MENAMAMA" : (isOlder(pB, aMother) ? "PEDDAMMA" : "PINNI"), isBio: false };
  }

  if (pB.spouseId) {
    const bSpouse = getMember(pB.spouseId);
    if (bSpouse) {
      if (aMother && areSiblings(aMother, bSpouse) && bSpouse.gender === "female") {
        return { role: isOlder(pB, aMother) ? "PEDDANANNA" : "BABAI", isBio: false };
      }
      if (aMother && areSiblings(aMother, bSpouse) && bSpouse.gender === "male") {
        return { role: "ATTAYYA", isBio: false };
      }
      if (aFather && areSiblings(aFather, bSpouse) && bSpouse.gender === "male") {
        return { role: isOlder(bSpouse, aFather) ? "PEDDAMMA" : "PINNI", isBio: false };
      }
      if (aFather && areSiblings(aFather, bSpouse) && bSpouse.gender === "female") {
        return { role: "MAMAYYA", isBio: false };
      }
    }
  }

  for (const bp of bParents) {
    if (aFather && areSiblings(aFather, bp)) {
      return {
        role: bp.gender === "male" ? (pB.gender === "male" ? "BROTHER" : "SISTER") : (pB.gender === "male" ? "CROSS_MALE_COUSIN" : "CROSS_FEMALE_COUSIN"),
        isBio: false
      };
    }
    if (aMother && areSiblings(aMother, bp)) {
      return {
        role: bp.gender === "female" ? (pB.gender === "male" ? "BROTHER" : "SISTER") : (pB.gender === "male" ? "CROSS_MALE_COUSIN" : "CROSS_FEMALE_COUSIN"),
        isBio: false
      };
    }
  }

  if (pA.spouseId) {
    const spouse = getMember(pA.spouseId);
    if (spouse) {
      if (getAllParents(spouse).some((p) => p.id === pB.id)) {
        return { role: pB.gender === "male" ? "MAMAGARU" : "ATTAGARU", isBio: false };
      }
      if (areSiblings(spouse, pB)) {
        return {
          role: pA.gender === "male"
            ? (pB.gender === "male" ? "WIFE_BROTHER" : "WIFE_SISTER")
            : (pB.gender === "male" ? "HUSBAND_BROTHER" : "HUSBAND_SISTER"),
          isBio: false
        };
      }
    }
  }

  const aSiblings = family.filter((m) => areSiblings(pA, m));
  for (const sib of aSiblings) {
    if (sib.spouseId === pB.id) {
      return { role: pB.gender === "male" ? "SISTER_HUSBAND" : "BROTHER_WIFE", isBio: false };
    }
  }

  for (const sib of aSiblings) {
    if (getAllParents(pB).some((p) => p.id === sib.id)) {
      const isCross = (pA.gender === "male" && sib.gender === "female") || (pA.gender === "female" && sib.gender === "male");
      return { role: isCross ? (pB.gender === "female" ? "MENAKODALU" : "MENALLUDU") : (pB.gender === "female" ? "DAUGHTER" : "SON"), isBio: false };
    }
  }

  const aChildren = family.filter((m) => getAllParents(m).some((p) => p.id === pA.id || (pA.spouseId && p.id === pA.spouseId)));
  for (const ch of aChildren) {
    if (ch.spouseId === pB.id) {
      return { role: pB.gender === "male" ? "ALLUDU" : "KODALU", isBio: false };
    }
  }

  return null;
}

function computeKinship(targetId) {
  if (targetId === focusPersonId) return "You (నేను)";
  if (kinshipCache.has(targetId)) return kinshipCache.get(targetId);
  kinshipCache.set(targetId, "");
  const result = computeKinshipUncached(targetId);
  kinshipCache.set(targetId, result);
  return result;
}

function computeKinshipUncached(targetId) {
  const focus = getMember(focusPersonId);
  const target = getMember(targetId);
  if (!focus || !target) return "";

  const direct = getDirectKinshipRole(focus, target);
  if (direct) return renderKinshipString(direct.role, direct.isBio, focus, target);

  if (focus.spouseId) {
    const spouse = getMember(focus.spouseId);
    if (spouse) {
      const relToSpouse = getDirectKinshipRole(spouse, target);
      if (relToSpouse) {
        const r = relToSpouse.role;
        if (r === "FATHER") return "మామగారు (Mamagaru)";
        if (r === "MOTHER") return "అత్తగారు / అత్త (Atthagaru)";
        if (r === "PATERNAL_GRANDFATHER" || r === "MATERNAL_GRANDFATHER") return "తాతగారు / తాతయ్య (Taatayya)";
        if (r === "MATERNAL_GRANDMOTHER") return "నానమ్మ (Nanamma)";
        if (r === "PATERNAL_GRANDMOTHER") return "అమ్మమ్మ (Ammamma)";

        if (focus.gender === "female") {
          if (r === "BROTHER") return isOlder(target, spouse) ? "బావగారు (Bavagaru)" : "మరిది (Maridi)";
          if (r === "SISTER") return isOlder(target, spouse) ? "వదిన (Vadina)" : "ఆడబిడ్డ (Aadabidda)";
        } else {
          if (r === "BROTHER") return isOlder(target, spouse) ? "బావగారు (Bavagaru)" : "బావమరిది (Bavamariidi)";
          if (r === "SISTER") return isOlder(target, spouse) ? "వదిన (Vadina)" : "మరదలు (Maradalu)";
        }

        if (r === "SISTER_HUSBAND") return isOlder(target, spouse) ? "బావగారు (Bavagaru)" : "బావగారు / మరిది (Bavagaru / Maridi)";
        if (r === "BROTHER_WIFE") return isOlder(target, spouse) ? "వదిన (Vadina)" : "మరదలు (Maradalu)";
        if (r === "MENALLUDU") return "మేనల్లుడు (Menalludu)";
        if (r === "MENAKODALU") return "మేనకోడలు (Menakodalu)";
        if (r === "SON") return "కొడుకు (Koduku)";
        if (r === "DAUGHTER") return "కూతురు (Kooturu)";

        if (r === "CROSS_MALE_COUSIN") {
          return focus.gender === "female"
            ? (isOlder(target, spouse) ? "బావగారు (Bavagaru)" : "మరిది (Maridi)")
            : (isOlder(target, spouse) ? "బావ (Bava)" : "బావమరిది (Bavamariidi)");
        }
        if (r === "CROSS_FEMALE_COUSIN") {
          return focus.gender === "female"
            ? (isOlder(target, spouse) ? "వదిన (Vadina)" : "ఆడబిడ్డ (Aadabidda)")
            : (isOlder(target, spouse) ? "వదిన (Vadina)" : "మరదలు (Maradalu)");
        }
      }
    }
  }

  const mySiblings = family.filter((m) => areSiblings(focus, m));
  for (const sib of mySiblings) {
    if (sib.spouseId) {
      const sibSpouse = getMember(sib.spouseId);
      if (sibSpouse) {
        if (sibSpouse.id === target.id) {
          return isOlder(sibSpouse, focus) ? "బావ (Bava)" : "మరిది (Maridi)";
        }
        if (getAllParents(target).some((p) => p.id === sib.id || p.id === sibSpouse.id)) {
          return target.gender === "male" ? "మేనల్లుడు (Menalludu)" : "మేనకోడలు (Menakodalu)";
        }
        const rArjun = getDirectKinshipRole(sibSpouse, target);
        if (rArjun) {
          const r = rArjun.role;
          if (r === "FATHER") return "మామగారు (Mamagaru)";
          if (r === "MOTHER") return "అత్తగారు (Attagaru)";
          if (r === "BROTHER") return isOlder(target, focus) ? "బావ (Bava)" : "మరిది (Maridi)";
          if (r === "SISTER") return isOlder(target, focus) ? "వదిన (Vadina)" : "మరదలు (Maradalu)";
          if (r === "PATERNAL_GRANDFATHER" || r === "MATERNAL_GRANDFATHER") return "తాతయ్య (Taatayya)";
          if (r === "PATERNAL_GRANDMOTHER") return "నానమ్మ (Nanamma)";
          if (r === "MATERNAL_GRANDMOTHER") return "అమ్మమ్మ (Ammamma)";
        }

        const arjunMother = getAllParents(sibSpouse).find((p) => p.gender === "female");
        if (arjunMother) {
          if (areSiblings(arjunMother, target) && target.gender === "male") return "బాబాయ్ (Babai)";
          if (target.spouseId) {
            const sp = getMember(target.spouseId);
            if (sp && areSiblings(arjunMother, sp) && sp.gender === "male") return "పిన్ని (Pinni)";
            if (sp && areSiblings(arjunMother, sp) && sp.gender === "female") return target.gender === "male" ? "మామయ్య (Mamayya)" : "అత్త (Atta)";
          }
          if (areSiblings(arjunMother, target) && target.gender === "female") {
            return isOlder(target, arjunMother) ? "పెద్దమ్మ (Peddamma)" : "అత్తయ్య (Attayya)";
          }

          const targetParents = getAllParents(target);
          for (const tp of targetParents) {
            if (areSiblings(arjunMother, tp) && tp.gender === "male") {
              return target.gender === "male"
                ? (isOlder(target, focus) ? "అన్నయ్య (Annayya)" : "తమ్ముడు (Tammudu)")
                : (isOlder(target, focus) ? "అక్క (Akka)" : "చెల్లి (Chelli)");
            }
            if (areSiblings(arjunMother, tp) && tp.gender === "female") {
              return target.gender === "male"
                ? (isOlder(target, focus) ? "బావ (Bava)" : "మరిది (Maridi)")
                : (isOlder(target, focus) ? "వదిన (Vadina)" : "మరదలు (Maradalu)");
            }
          }
        }
      }
    }
  }

  if (target.spouseId) {
    const tSpouse = getMember(target.spouseId);
    if (tSpouse) {
      const sRelStr = computeKinship(tSpouse.id);
      if (sRelStr.includes("మేనల్లుడు") || sRelStr.includes("కొడుకు")) {
        return target.gender === "female" ? "కోడలు (Kodalu)" : "అల్లుడు (Alludu)";
      }
      if (sRelStr.includes("మేనకోడలు") || sRelStr.includes("కూతురు")) {
        return target.gender === "male" ? "అల్లుడు (Alludu)" : "కోడలు (Kodalu)";
      }
      if (sRelStr.includes("మనవడు")) return "మనమకోడలు (Manamakodalu)";
      if (sRelStr.includes("మనవరాలు")) return "మనమఅల్లుడు (Manama'alludu)";
      if (sRelStr.includes("బావగారు") || sRelStr.includes("బావ")) return isOlder(target, focus) ? "వదిన (Vadina)" : "మరదలు (Maradalu)";
    }
  }

  for (const p of getAllParents(target)) {
    const pRelStr = computeKinship(p.id);
    if (pRelStr.includes("కొడుకు") || pRelStr.includes("కూతురు") || pRelStr.includes("మేనల్లుడు") || pRelStr.includes("మేనకోడలు")) {
      return target.gender === "male" ? "మనవడు (Manavadu)" : "మనవరాలు (Manavaralu)";
    }
    if (pRelStr.includes("మనవడు") || pRelStr.includes("మనవరాలు")) {
      return target.gender === "male" ? "మునిమనవడు (Munimanavadu)" : "మునిమనవరాలు (Munimanavaralu)";
    }
  }

  const allRelatives = family.filter((m) => m.id !== focus.id);
  for (const rel of allRelatives) {
    const relStr = computeKinship(rel.id);
    if (relStr.includes("కోడలు") || relStr.includes("అల్లుడు") || relStr.includes("మనమకోడలు")) {
      if (getAllParents(rel).some((p) => p.id === target.id)) {
        return target.gender === "male" ? "వియ్యంకుడు (Viyyankudu)" : "వియ్యపురాలు (Viyyaralu)";
      }
      if (areSiblings(rel, target)) {
        return target.gender === "female" ? "కోడలు వరుస (Kodalu)" : "అల్లుడు (Alludu)";
      }
    }
    if (relStr.includes("ఆడబిడ్డ") || relStr.includes("బావగారు") || relStr.includes("మరిది")) {
      if (getAllParents(rel).some((p) => p.id === target.id)) {
        return target.gender === "male" ? "వియ్యంకుడు (Viyyankudu)" : "వియ్యపురాలు (Viyyaralu)";
      }
    }
  }

  const focusChildren = family.filter((m) => getAllParents(m).some((p) => p.id === focus.id || (focus.spouseId && p.id === focus.spouseId)));
  for (const ch of focusChildren) {
    if (ch.spouseId) {
      const chSpouse = getMember(ch.spouseId);
      if (chSpouse) {
        if (getAllParents(chSpouse).some((p) => p.id === target.id)) {
          return target.gender === "male" ? "వియ్యంకుడు (Viyyankudu)" : "వియ్యపురాలు (Viyyaralu)";
        }
        if (areSiblings(chSpouse, target) && target.gender === "female") return "కోడలు (Kodalu)";
        const spouseSisters = family.filter((m) => areSiblings(chSpouse, m) && m.gender === "female");
        if (spouseSisters.some((s) => s.spouseId === target.id)) return "కొడుకు (Koduku)";
        if (areSiblings(chSpouse, target) && target.gender === "male") return "అల్లుడు (Alludu)";
        const spouseBrothers = family.filter((m) => areSiblings(chSpouse, m) && m.gender === "male");
        if (spouseBrothers.some((b) => b.spouseId === target.id)) return "కూతురు (Kooturu)";
      }
    }
  }

  return "చుట్టరికం (Relative)";
}

function renderKinshipString(role, isBio, focus, target) {
  const tag = isBio ? " [సొంత]" : "";

  if (role === "SPOUSE") return target.gender === "female" ? `భార్య (Bharya)${tag}` : `భర్త (Bhartha)${tag}`;
  if (role === "FATHER") return `తండ్రి / నాన్న (Tandri / Nanna)${tag}`;
  if (role === "MOTHER") return `తల్లి / అమ్మ (Talli / Amma)${tag}`;
  if (role === "SON") return `కొడుకు (Koduku)${tag}`;
  if (role === "DAUGHTER") return `కూతురు (Kooturu)${tag}`;
  if (role === "BROTHER") return isOlder(target, focus) ? `అన్నయ్య (Annayya)${tag}` : `తమ్ముడు (Tammudu)${tag}`;
  if (role === "SISTER") return isOlder(target, focus) ? `అక్క (Akka)${tag}` : `చెల్లి (Chelli)${tag}`;

  if (role === "MAMAGARU") return "మామగారు (Mamagaru)";
  if (role === "ATTAGARU") return "అత్తగారు / అత్త (Atthagaru)";
  if (role === "KODALU") return "కోడలు (Kodalu)";
  if (role === "ALLUDU") return "అల్లుడు (Alludu)";
  if (role === "MENALLUDU") return "మేనల్లుడు (Menalludu)";
  if (role === "MENAKODALU") return "మేనకోడలు (Menakodalu)";

  if (role === "WIFE_BROTHER") return isOlder(target, focus) ? "బావ (Bava)" : "బావమరిది (Bavamariidi)";
  if (role === "WIFE_SISTER") return isOlder(target, focus) ? "వదిన (Vadina)" : "మరదలు (Maradalu)";
  if (role === "HUSBAND_BROTHER") return isOlder(target, focus) ? "బావగారు (Bavagaru)" : "మరిది (Maridi)";
  if (role === "HUSBAND_SISTER") return "ఆడబిడ్డ (Aadabidda)";

  if (role === "BROTHER_WIFE") return isOlder(target, focus) ? "వదిన (Vadina)" : "మరదలు (Maradalu)";
  if (role === "SISTER_HUSBAND") return isOlder(target, focus) ? "బావగారు (Bavagaru)" : "బావ / మరిది (Bavagaru / Maridi)";

  if (role === "PATERNAL_GRANDFATHER" || role === "MATERNAL_GRANDFATHER") return `తాతయ్య (Taatayya)${tag}`;
  if (role === "PATERNAL_GRANDMOTHER") return `నానమ్మ (Nanamma)${tag}`;
  if (role === "MATERNAL_GRANDMOTHER") return `అమ్మమ్మ (Ammamma)${tag}`;

  if (role === "PEDDANANNA") return "పెద్దనాన్న (Peddananna)";
  if (role === "BABAI") return "బాబాయ్ (Babai)";
  if (role === "PEDDAMMA") return "పెద్దమ్మ (Peddamma)";
  if (role === "PINNI") return "పిన్ని (Pinni)";
  if (role === "MENATTHA") return "మేనత్త / అత్తయ్య (Menattha)";
  if (role === "ATTAYYA") return "అత్తయ్య (Attayya)";
  if (role === "MENAMAMA") return "మేనమామ / మామయ్య (Menamama)";
  if (role === "MAMAYYA") return "మామయ్య (Mamayya)";

  if (role === "CROSS_MALE_COUSIN") {
    return focus.gender === "female"
      ? (isOlder(target, focus) ? "బావగారు (Bavagaru)" : "మరిది (Maridi)")
      : (isOlder(target, focus) ? "బావ (Bava)" : "బావమరిది (Bavamariidi)");
  }
  if (role === "CROSS_FEMALE_COUSIN") {
    return focus.gender === "female"
      ? (isOlder(target, focus) ? "వదిన (Vadina)" : "ఆడబిడ్డ (Aadabidda)")
      : (isOlder(target, focus) ? "వదిన (Vadina)" : "మరదలు (Maradalu)");
  }

  return "చుట్టరికం (Relative)";
}

function setFocusPerson(id) {
  focusPersonId = id;
  persistFamilyData();
  renderTree();
  updateHeaderInputs();
  centerOnFocus();
}

function deleteMember(id) {
  const person = getMember(id);
  if (!person) return;
  if (!confirm(`Are you sure you want to delete ${person.name}?`)) return;

  if (person.spouseId) {
    const spouse = getMember(person.spouseId);
    if (spouse) {
      spouse.spouseId = null;
      spouse.anniversary = null;
    }
  }

  family.forEach((m) => {
    if (m.parentIds && m.parentIds.includes(id)) {
      m.parentIds = m.parentIds.filter((pId) => pId !== id);
    }
  });

  family = family.filter((m) => m.id !== id);
  rebuildIndexes();

  if (focusPersonId === id) {
    focusPersonId = family[0] ? family[0].id : "1";
  }

  persistFamilyData();
  renderTree();
  updateHeaderInputs();
}

function clearStorageAndReset() {
  if (confirm("Reset tree to default members?")) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FOCUS_KEY);
    family = [];
    initializeApp().then(() => resetZoom());
  }
}

function calculateAgeFromDob(dobStr) {
  if (!dobStr) return "";
  const birth = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : 0;
}

function syncDobToAge(dobInputId, ageInputId) {
  const dobVal = document.getElementById(dobInputId).value;
  const ageInput = document.getElementById(ageInputId);
  if (!dobVal) { ageInput.value = ""; return; }
  ageInput.value = calculateAgeFromDob(dobVal);
}

function syncAgeToDob(ageInputId, dobInputId) {
  const ageVal = parseInt(document.getElementById(ageInputId).value, 10);
  const dobInput = document.getElementById(dobInputId);
  if (isNaN(ageVal) || ageVal < 0) { dobInput.value = ""; return; }
  const currentYear = new Date().getFullYear();
  dobInput.value = `${currentYear - ageVal}-01-01`;
}

function setupCanvas() {
  if (viewport) return;
  viewport = d3.select("#viewport");
  svg = d3.select("#treeCanvas");
  container = svg.append("g");
  nodesLayer = document.getElementById("nodesLayer");

  zoom = d3.zoom()
    .scaleExtent([0.12, 2.5])
    .filter((event) => {
      const t = event.target;
      if (t.closest && t.closest("button, input, select, textarea, a, label")) return false;
      return (!event.ctrlKey || event.type === "wheel") && !event.button;
    })
    .on("zoom", (e) => {
      const { x, y, k } = e.transform;
      container.attr("transform", e.transform);
      nodesLayer.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
    });

  viewport.call(zoom);
}

function getRootPerson() {
  return family.find((d) =>
    (d.parentIds || []).length === 0 &&
    (!d.spouseId || d.gender === "male" || !getMember(d.spouseId))
  ) || family[0];
}

function updateHeaderInputs() {
  const root = getRootPerson();
  if (root) {
    document.getElementById("mainPersonInput").value = root.name;
    const menuInput = document.getElementById("mainPersonInputMenu");
    if (menuInput) menuInput.value = root.name;
  }
  const focus = getMember(focusPersonId) || root;
  if (focus) document.getElementById("focusStatus").innerText = focus.name;
}

function saveMainPersonName(fromMenu) {
  const sourceId = fromMenu ? "mainPersonInputMenu" : "mainPersonInput";
  const input = document.getElementById(sourceId).value.trim();
  if (!input) return;
  const root = getRootPerson();
  if (root) {
    root.name = input;
    persistFamilyData();
    renderTree();
    updateHeaderInputs();
  }
}

function buildGraphLayout(data) {
  const visited = new Set();
  const units = [];

  data.forEach((m) => {
    if (visited.has(m.id)) return;
    const spouse = m.spouseId ? data.find((x) => x.id === m.spouseId) : null;
    const primary = (spouse && m.gender === "female" && spouse.gender === "male") ? spouse : m;
    const secondary = primary === m ? spouse : m;
    const card = { id: `card_${primary.id}`, primary, secondary, children: [] };
    units.push(card);
    visited.add(primary.id);
    if (secondary) visited.add(secondary.id);
  });

  const genMap = new Map();
  function getGen(mId, visitedTrace = new Set()) {
    if (visitedTrace.has(mId)) return 0;
    visitedTrace.add(mId);
    const m = data.find((x) => x.id === mId);
    if (!m || !m.parentIds || m.parentIds.length === 0) return 0;
    return Math.max(...m.parentIds.map((p) => getGen(p, new Set(visitedTrace)))) + 1;
  }

  units.forEach((u) => {
    const g1 = getGen(u.primary.id);
    const g2 = u.secondary ? getGen(u.secondary.id) : 0;
    genMap.set(u.id, Math.max(g1, g2));
  });

  const genBuckets = new Map();
  units.forEach((u) => {
    const g = genMap.get(u.id) || 0;
    if (!genBuckets.has(g)) genBuckets.set(g, []);
    genBuckets.get(g).push(u);
  });

  const cardsWithPos = [];
  const CARD_WIDTH = 320;
  const X_GAP = 48;
  const Y_GAP = 250;

  genBuckets.forEach((cardsInGen, g) => {
    cardsInGen.sort((a, b) => a.primary.name.localeCompare(b.primary.name));
    if (cardsInGen.length > 1) {
      const focusIdx = cardsInGen.findIndex((c) =>
        c.primary.id === focusPersonId || (c.secondary && c.secondary.id === focusPersonId)
      );
      if (focusIdx > 0) {
        const [focusCard] = cardsInGen.splice(focusIdx, 1);
        cardsInGen.splice(Math.floor(cardsInGen.length / 2), 0, focusCard);
      }
    }
    const totalWidth = cardsInGen.length * CARD_WIDTH + (cardsInGen.length - 1) * X_GAP;
    const startX = -totalWidth / 2 + CARD_WIDTH / 2;
    cardsInGen.forEach((card, idx) => {
      card.x = startX + idx * (CARD_WIDTH + X_GAP);
      card.y = g * Y_GAP;
      cardsWithPos.push(card);
    });
  });

  const links = [];
  cardsWithPos.forEach((childCard) => {
    const pParents = childCard.primary.parentIds || [];
    if (pParents.length > 0) {
      const parentCard = cardsWithPos.find((c) => c.primary.id === pParents[0] || (c.secondary && c.secondary.id === pParents[0]));
      if (parentCard) {
        links.push({
          source: { x: parentCard.x, y: parentCard.y + 150 },
          target: { x: childCard.x - (childCard.secondary ? 50 : 0), y: childCard.y - 20 }
        });
      }
    }
    if (childCard.secondary) {
      const mParents = childCard.secondary.parentIds || [];
      if (mParents.length > 0) {
        const mParentCard = cardsWithPos.find((c) => c.primary.id === mParents[0] || (c.secondary && c.secondary.id === mParents[0]));
        if (mParentCard) {
          links.push({
            source: { x: mParentCard.x, y: mParentCard.y + 150 },
            target: { x: childCard.x + 50, y: childCard.y - 20 }
          });
        }
      }
    }
  });

  return { cards: cardsWithPos, links };
}

function personBlockHtml(person, isActive, isSpouse) {
  const relation = computeKinship(person.id);
  const age = calculateAgeFromDob(person.dob);
  const side = isSpouse ? "spouse" : "";
  return `
    <div class="person-block ${side} ${isActive ? "active" : ""}" data-id="${person.id}">
      ${isSpouse ? "" : `<div class="avatar ${person.gender}">${person.gender === "female" ? FEMALE_ICON : MALE_ICON}</div>`}
      <div>
        <div class="person-name">
          ${isSpouse ? `<button type="button" class="icon-action" data-del="${person.id}" title="Delete">🗑️</button>
            <button type="button" class="icon-action" data-edit="${person.id}" title="Edit">✏️</button>` : ""}
          <span>${escapeHtml(person.name)}</span>
          ${isSpouse ? "" : `<button type="button" class="icon-action" data-edit="${person.id}" title="Edit">✏️</button>
            <button type="button" class="icon-action" data-del="${person.id}" title="Delete">🗑️</button>`}
        </div>
        <p class="person-rel">${escapeHtml(relation)}</p>
        <p class="person-age">${age !== "" ? `Age: ${age}y` : (person.dob || "DOB —")}</p>
      </div>
      ${isSpouse ? `<div class="avatar ${person.gender}">${person.gender === "female" ? FEMALE_ICON : MALE_ICON}</div>` : ""}
    </div>
  `;
}

function cardHtml(d) {
  const m = d.primary;
  const spouse = d.secondary;
  const isSpouseActive = spouse && focusPersonId === spouse.id;
  const activePerson = isSpouseActive ? spouse : m;
  const isMainActive = focusPersonId === m.id || (spouse && focusPersonId === spouse.id);
  const activeAge = calculateAgeFromDob(activePerson.dob);
  const isChild = activeAge !== "" && activeAge < 18;
  const hasFather = getAllParents(activePerson).some((p) => p.gender === "male");
  const hasMother = getAllParents(activePerson).some((p) => p.gender === "female");

  return `
    <article class="person-card ${isMainActive ? "is-focus" : ""}" data-card="${m.id}" style="left:${d.x - 160}px;top:${d.y - 24}px">
      <div class="person-row">
        ${personBlockHtml(m, !isSpouseActive, false)}
        ${spouse ? personBlockHtml(spouse, isSpouseActive, true) : ""}
      </div>
      <div class="card-label">
        <span>Actions for: <strong>${escapeHtml(activePerson.name)}</strong></span>
        <span class="card-hint">${spouse ? "Tap spouse to switch" : ""}</span>
      </div>
      <div class="add-grid" data-active="${activePerson.id}">
        <button type="button" class="add-btn" data-add="father" ${hasFather ? "disabled" : ""}>+ Nanna</button>
        <button type="button" class="add-btn" data-add="mother" ${hasMother ? "disabled" : ""}>+ Amma</button>
        <button type="button" class="add-btn" data-add="spouse" ${spouse || isChild ? "style='display:none'" : ""}>+ Spouse</button>
        <button type="button" class="add-btn" data-add="child">+ Child</button>
        <button type="button" class="add-btn" data-add="brother">+ Brother</button>
        <button type="button" class="add-btn" data-add="sister">+ Sister</button>
      </div>
    </article>
  `;
}

function renderTree() {
  rebuildIndexes();
  const { cards, links } = buildGraphLayout(family);
  lastLayout = { cards, links };

  container.selectAll("*").remove();
  container.selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link-line")
    .attr("d", d3.linkVertical().x((d) => d.x).y((d) => d.y));

  nodesLayer.innerHTML = cards.map(cardHtml).join("");
  bindCardEvents();
  updateEventsList();
  updateMembersList();
  updateFocusActions();
}

function bindCardEvents() {
  nodesLayer.onclick = (event) => {
    const del = event.target.closest("[data-del]");
    if (del) { event.stopPropagation(); deleteMember(del.getAttribute("data-del")); return; }
    const edit = event.target.closest("[data-edit]");
    if (edit) { event.stopPropagation(); openEditModal(edit.getAttribute("data-edit")); return; }
    const add = event.target.closest("[data-add]");
    if (add) {
      event.stopPropagation();
      const targetId = add.parentElement.getAttribute("data-active");
      openAddModal(targetId, add.getAttribute("data-add"));
      return;
    }
    const block = event.target.closest(".person-block");
    if (block) {
      const id = block.getAttribute("data-id");
      if (id && id !== focusPersonId) setFocusPerson(id);
    }
  };
}

function openEditModal(memberId) {
  const member = getMember(memberId);
  if (!member) return;
  document.getElementById("editMemberId").value = member.id;
  document.getElementById("editFullName").value = member.name;
  document.getElementById("editGender").value = member.gender || "male";
  document.getElementById("editDob").value = member.dob || "";
  document.getElementById("editAge").value = calculateAgeFromDob(member.dob);
  document.getElementById("editAnniversary").value = member.anniversary || "";
  document.getElementById("editAnniversaryGroup").classList.toggle("hidden", !member.spouseId);
  document.getElementById("editModal").classList.remove("hidden");
}

function handleEditFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("editMemberId").value;
  const member = getMember(id);
  if (!member) return;

  member.name = document.getElementById("editFullName").value.trim();
  member.gender = document.getElementById("editGender").value;
  member.dob = document.getElementById("editDob").value || null;
  const anniversary = document.getElementById("editAnniversary").value || null;
  member.anniversary = anniversary;
  if (member.spouseId) {
    const spouse = getMember(member.spouseId);
    if (spouse) spouse.anniversary = anniversary;
  }

  persistFamilyData();
  closeModal("editModal");
  renderTree();
  updateHeaderInputs();
}

function openAddModal(targetId, type) {
  document.getElementById("formTargetId").value = targetId;
  document.getElementById("formRelationType").value = type;
  document.getElementById("memberForm").reset();
  document.getElementById("formTargetId").value = targetId;
  document.getElementById("formRelationType").value = type;

  const target = getMember(targetId);
  const targetName = target ? target.name : "Member";
  const labels = {
    father: `Add Nanna (Father) for ${targetName}`,
    mother: `Add Amma (Mother) for ${targetName}`,
    child: `Add Child for ${targetName}`,
    spouse: `Add Spouse for ${targetName}`,
    brother: `Add Brother for ${targetName}`,
    sister: `Add Sister for ${targetName}`
  };

  document.getElementById("modalTitle").innerText = labels[type] || "Add Relative";
  const genderSelect = document.getElementById("formGender");
  if (type === "father" || type === "brother") genderSelect.value = "male";
  if (type === "mother" || type === "sister") genderSelect.value = "female";
  document.getElementById("anniversaryGroup").classList.toggle("hidden", type !== "spouse");
  document.getElementById("addModal").classList.remove("hidden");
  setTimeout(() => document.getElementById("formFullName").focus(), 50);
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

function handleFormSubmit(e) {
  e.preventDefault();
  const targetId = document.getElementById("formTargetId").value;
  const type = document.getElementById("formRelationType").value;
  const name = document.getElementById("formFullName").value.trim();
  const gender = document.getElementById("formGender").value;
  const dob = document.getElementById("formDob").value;
  const anniversary = document.getElementById("formAnniversary").value;
  if (!name) return;

  const newId = String(Date.now());
  const newMember = {
    id: newId,
    name,
    gender,
    dob: dob || null,
    spouseId: null,
    anniversary: null,
    parentIds: []
  };

  const target = getMember(targetId);
  if (!target) return;

  if (type === "child") {
    newMember.parentIds = target.spouseId ? [target.id, target.spouseId] : [target.id];
  } else if (type === "spouse") {
    newMember.spouseId = targetId;
    newMember.anniversary = anniversary || null;
    target.spouseId = newId;
    target.anniversary = anniversary || null;
  } else if (type === "father" || type === "mother") {
    if (!target.parentIds) target.parentIds = [];
    const existingParent = getAllParents(target).find((p) => type === "father" ? p.gender === "female" : p.gender === "male");
    if (existingParent) {
      newMember.spouseId = existingParent.id;
      existingParent.spouseId = newId;
    }
    target.parentIds.push(newId);
  } else if (type === "brother" || type === "sister") {
    const parents = getAllParents(target);
    if (parents.length > 0) {
      newMember.parentIds = parents.map((p) => p.id);
    } else {
      const parentId = String(Date.now() - 100);
      const defaultParent = {
        id: parentId,
        name: `${target.name}'s Parents`,
        gender: "male",
        dob: null,
        spouseId: null,
        anniversary: null,
        parentIds: []
      };
      family.push(defaultParent);
      target.parentIds = [parentId];
      newMember.parentIds = [parentId];
    }
  }

  family.push(newMember);
  closeModal("addModal");
  document.getElementById("memberForm").reset();
  setFocusPerson(newId);
}

function checkUpcoming(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const d = new Date(dateStr);
  d.setFullYear(today.getFullYear());
  const diff = (d - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 30;
}

function updateEventsList() {
  const list = document.getElementById("eventsList");
  const events = [];
  family.forEach((m) => {
    if (checkUpcoming(m.dob)) events.push(`🎂 <strong>${escapeHtml(m.name)}</strong>'s Birthday (${m.dob.slice(5)})`);
    if (m.anniversary && checkUpcoming(m.anniversary)) {
      const spouse = getMember(m.spouseId);
      events.push(`💍 <strong>${escapeHtml(m.name)} & ${escapeHtml(spouse ? spouse.name : "")}</strong>'s Anniversary (${m.anniversary.slice(5)})`);
    }
  });
  const unique = [...new Set(events)];
  list.innerHTML = unique.length
    ? unique.map((e) => `<div class="event-item">${e}</div>`).join("")
    : `<p class="muted">No events in next 30 days.</p>`;
}

function updateMembersList() {
  const el = document.getElementById("membersList");
  const count = document.getElementById("memberCount");
  if (count) count.textContent = String(family.length);
  if (!el) return;
  const q = (document.getElementById("memberFilter")?.value || "").trim().toLowerCase();
  const rows = family
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((m) => !q || m.name.toLowerCase().includes(q))
    .map((m) => `
      <button type="button" class="member-row ${m.id === focusPersonId ? "active" : ""}" onclick="setFocusPerson('${m.id}')">
        <span class="avatar ${m.gender}">${m.gender === "female" ? FEMALE_ICON : MALE_ICON}</span>
        <span class="member-meta">
          <span class="member-name">${escapeHtml(m.name)}</span>
          <span class="member-rel">${escapeHtml(computeKinship(m.id))}</span>
        </span>
      </button>
    `).join("");
  el.innerHTML = rows || `<p class="muted">No members match.</p>`;
}

function updateFocusActions() {
  const box = document.getElementById("focusActions");
  if (!box) return;
  const person = getMember(focusPersonId);
  if (!person) { box.innerHTML = ""; return; }
  const age = calculateAgeFromDob(person.dob);
  const isChild = age !== "" && age < 18;
  const hasFather = getAllParents(person).some((p) => p.gender === "male");
  const hasMother = getAllParents(person).some((p) => p.gender === "female");
  const hasSpouse = Boolean(person.spouseId);
  box.innerHTML = `
    <h3>Add relative to ${escapeHtml(person.name)}</h3>
    <div class="add-grid" data-active="${person.id}">
      <button type="button" class="add-btn" ${hasFather ? "disabled" : ""} onclick="openAddModal('${person.id}', 'father')">+ Nanna</button>
      <button type="button" class="add-btn" ${hasMother ? "disabled" : ""} onclick="openAddModal('${person.id}', 'mother')">+ Amma</button>
      <button type="button" class="add-btn" ${hasSpouse || isChild ? "disabled" : ""} onclick="openAddModal('${person.id}', 'spouse')">+ Spouse</button>
      <button type="button" class="add-btn" onclick="openAddModal('${person.id}', 'child')">+ Child</button>
      <button type="button" class="add-btn" onclick="openAddModal('${person.id}', 'brother')">+ Brother</button>
      <button type="button" class="add-btn" onclick="openAddModal('${person.id}', 'sister')">+ Sister</button>
    </div>
  `;
}

let searchTimer = null;
function handleSearch(term) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    const q = term.trim().toLowerCase();
    if (!q) return;
    const found = family.find((f) => f.name.toLowerCase().includes(q));
    if (found && found.id !== focusPersonId) setFocusPerson(found.id);
  }, 120);
}

function centerOnFocus(animate = true) {
  if (!lastLayout || !viewport) return;
  const card = lastLayout.cards.find((c) =>
    c.primary.id === focusPersonId || (c.secondary && c.secondary.id === focusPersonId)
  );
  if (!card) return;
  const w = window.innerWidth || 800;
  const isMobile = w < 768;
  const current = d3.zoomTransform(viewport.node());
  const scale = current.k || (isMobile ? 0.55 : 0.75);
  const headerH = isMobile ? 130 : 100;
  const x = w / 2 - card.x * scale;
  const y = headerH + 90 - card.y * scale;
  const t = d3.zoomIdentity.translate(x, y).scale(scale);
  if (animate) viewport.transition().duration(320).call(zoom.transform, t);
  else viewport.call(zoom.transform, t);
}

function resetZoom(animate = true) {
  if (!viewport || !lastLayout) return;
  const w = window.innerWidth || 800;
  const isMobile = w < 768;
  const scale = isMobile ? 0.5 : 0.72;
  const card = lastLayout.cards.find((c) =>
    c.primary.id === focusPersonId || (c.secondary && c.secondary.id === focusPersonId)
  ) || lastLayout.cards[0];
  const headerH = isMobile ? 130 : 100;
  const x = w / 2 - (card ? card.x * scale : 0);
  const y = headerH + 80 - (card ? card.y * scale : 0);
  const t = d3.zoomIdentity.translate(x, y).scale(scale);
  if (animate) viewport.transition().duration(400).call(zoom.transform, t);
  else viewport.call(zoom.transform, t);
}

function toggleEventsPanel() {
  document.getElementById("membersDrawer").classList.add("hidden");
  document.getElementById("eventsDrawer").classList.toggle("hidden");
}

function toggleMembersPanel() {
  document.getElementById("eventsDrawer").classList.add("hidden");
  document.getElementById("membersDrawer").classList.toggle("hidden");
  updateMembersList();
  updateFocusActions();
}

function toggleHeaderMenu() {
  document.getElementById("headerMenu").classList.toggle("hidden");
}

window.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});
