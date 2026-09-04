const STORAGE_KEY = "telugu_family_tree_data_v31";
const FOCUS_KEY = "telugu_family_tree_focus_v31";

const MALE_ICON = `<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>`;
const FEMALE_ICON = `<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.9 1.2 3.5 2.8 4.2C7 11.5 4 14.2 4 18v2h16v-2c0-3.8-3-6.5-6.3-7.3 1.6-.7 2.8-2.3 2.8-4.2A4.5 4.5 0 0 0 12 2zm0 2c1.4 0 2.5 1.1 2.5 2.5S13.4 9 12 9s-2.5-1.1-2.5-2.5S10.6 4 12 4z"/><circle cx="12" cy="5.8" r="1.1" fill="#f43f5e"/></svg>`;

let family = [];
let focusPersonId = "";

async function initializeApp() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        family = parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (family.length === 0) {
    try {
      const res = await fetch('family_data.json');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        family = data;
      }
    } catch (e) {
      console.warn("Could not load external JSON fallback, using minimal default.");
      family = [
        { id: "1", name: "laxman", gender: "male", dob: "1962-01-01", spouseId: "2", anniversary: "1985-05-18", parentIds: [] },
        { id: "2", name: "kalavathi", gender: "female", dob: "1970-01-01", spouseId: "1", anniversary: "1985-05-18", parentIds: [] }
      ];
    }
  }

  const savedFocus = localStorage.getItem(FOCUS_KEY);
  if (savedFocus && family.some(m => m.id === savedFocus)) {
    focusPersonId = savedFocus;
  } else {
    const arjun = family.find(m => m.name.toLowerCase() === "arjun");
    focusPersonId = arjun ? arjun.id : (family[0]?.id || "1");
  }

  updateHeaderInputs();
  renderTree();
  setTimeout(resetZoom, 150);
}

function persistFamilyData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(family));
  localStorage.setItem(FOCUS_KEY, focusPersonId);
}

function exportFamilyJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(family, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `family_tree_backup.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importFamilyJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported) && imported.length > 0) {
        family = imported;
        focusPersonId = family[0].id;
        persistFamilyData();
        renderTree();
        updateHeaderInputs();
        alert(`Loaded ${family.length} relatives successfully!`);
      }
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

const isOlder = (p1, p2) => {
  if (!p1 || !p2 || !p1.dob || !p2.dob) return false;
  return new Date(p1.dob) < new Date(p2.dob);
};

function getAllParents(person) {
  if (!person) return [];
  const pSet = new Set(person.parentIds || []);
  (person.parentIds || []).forEach(pId => {
    const parent = family.find(m => m.id === pId);
    if (parent && parent.spouseId) pSet.add(parent.spouseId);
  });
  return Array.from(pSet).map(id => family.find(m => m.id === id)).filter(Boolean);
}

const areSiblings = (p1, p2) => {
  if (!p1 || !p2 || p1.id === p2.id) return false;
  const p1Parents = getAllParents(p1).map(p => p.id);
  const p2Parents = getAllParents(p2).map(p => p.id);
  return p1Parents.some(id => p2Parents.includes(id));
};

function getDirectKinshipRole(pA, pB) {
  if (!pA || !pB || pA.id === pB.id) return null;
  if (pA.spouseId === pB.id) return { role: 'SPOUSE', isBio: true };

  const aParents = getAllParents(pA);
  const bParents = getAllParents(pB);

  if (aParents.some(p => p.id === pB.id)) {
    return { role: pB.gender === 'male' ? 'FATHER' : 'MOTHER', isBio: true };
  }
  if (bParents.some(p => p.id === pA.id || (pA.spouseId && p.id === pA.spouseId))) {
    return { role: pB.gender === 'male' ? 'SON' : 'DAUGHTER', isBio: (pB.parentIds || []).includes(pA.id) };
  }
  if (areSiblings(pA, pB)) {
    return { role: pB.gender === 'male' ? 'BROTHER' : 'SISTER', isBio: true };
  }

  const aFather = aParents.find(p => p.gender === 'male');
  const aMother = aParents.find(p => p.gender === 'female');

  if (aFather && getAllParents(aFather).some(p => p.id === pB.id)) {
    return { role: pB.gender === 'male' ? 'PATERNAL_GRANDFATHER' : 'PATERNAL_GRANDMOTHER', isBio: true };
  }
  if (aMother && getAllParents(aMother).some(p => p.id === pB.id)) {
    return { role: pB.gender === 'male' ? 'MATERNAL_GRANDFATHER' : 'MATERNAL_GRANDMOTHER', isBio: true };
  }

  if (aFather && areSiblings(aFather, pB)) {
    return { role: pB.gender === 'male' ? (isOlder(pB, aFather) ? 'PEDDANANNA' : 'BABAI') : 'MENATTHA', isBio: false };
  }
  if (aMother && areSiblings(aMother, pB)) {
    return { role: pB.gender === 'male' ? 'MENAMAMA' : (isOlder(pB, aMother) ? 'PEDDAMMA' : 'PINNI'), isBio: false };
  }

  if (pB.spouseId) {
    const bSpouse = family.find(m => m.id === pB.spouseId);
    if (bSpouse) {
      if (aMother && areSiblings(aMother, bSpouse) && bSpouse.gender === 'female') {
        return { role: isOlder(pB, aMother) ? 'PEDDANANNA' : 'BABAI', isBio: false };
      }
      if (aMother && areSiblings(aMother, bSpouse) && bSpouse.gender === 'male') {
        return { role: 'ATTAYYA', isBio: false };
      }
      if (aFather && areSiblings(aFather, bSpouse) && bSpouse.gender === 'male') {
        return { role: isOlder(bSpouse, aFather) ? 'PEDDAMMA' : 'PINNI', isBio: false };
      }
      if (aFather && areSiblings(aFather, bSpouse) && bSpouse.gender === 'female') {
        return { role: 'MAMAYYA', isBio: false };
      }
    }
  }

  for (let bp of bParents) {
    if (aFather && areSiblings(aFather, bp)) {
      return {
        role: bp.gender === 'male' ? (pB.gender === 'male' ? 'BROTHER' : 'SISTER') : (pB.gender === 'male' ? 'CROSS_MALE_COUSIN' : 'CROSS_FEMALE_COUSIN'),
        isBio: false
      };
    }
    if (aMother && areSiblings(aMother, bp)) {
      return {
        role: bp.gender === 'female' ? (pB.gender === 'male' ? 'BROTHER' : 'SISTER') : (pB.gender === 'male' ? 'CROSS_MALE_COUSIN' : 'CROSS_FEMALE_COUSIN'),
        isBio: false
      };
    }
  }

  if (pA.spouseId) {
    const spouse = family.find(m => m.id === pA.spouseId);
    if (spouse) {
      if (getAllParents(spouse).some(p => p.id === pB.id)) {
        return { role: pB.gender === 'male' ? 'MAMAGARU' : 'ATTAGARU', isBio: false };
      }
      if (areSiblings(spouse, pB)) {
        return {
          role: pA.gender === 'male' 
            ? (pB.gender === 'male' ? 'WIFE_BROTHER' : 'WIFE_SISTER')
            : (pB.gender === 'male' ? 'HUSBAND_BROTHER' : 'HUSBAND_SISTER'),
          isBio: false
        };
      }
    }
  }

  const aSiblings = family.filter(m => areSiblings(pA, m));
  for (let sib of aSiblings) {
    if (sib.spouseId === pB.id) {
      return { role: pB.gender === 'male' ? 'SISTER_HUSBAND' : 'BROTHER_WIFE', isBio: false };
    }
  }

  for (let sib of aSiblings) {
    if (getAllParents(pB).some(p => p.id === sib.id)) {
      const isCross = (pA.gender === 'male' && sib.gender === 'female') || (pA.gender === 'female' && sib.gender === 'male');
      return { role: isCross ? (pB.gender === 'female' ? 'MENAKODALU' : 'MENALLUDU') : (pB.gender === 'female' ? 'DAUGHTER' : 'SON'), isBio: false };
    }
  }

  const aChildren = family.filter(m => getAllParents(m).some(p => p.id === pA.id || (pA.spouseId && p.id === pA.spouseId)));
  for (let ch of aChildren) {
    if (ch.spouseId === pB.id) {
      return { role: pB.gender === 'male' ? 'ALLUDU' : 'KODALU', isBio: false };
    }
  }

  return null;
}

function computeKinship(targetId, visited = new Set()) {
  if (targetId === focusPersonId) return "You (నేను)";
  if (visited.has(targetId)) return "";
  visited.add(targetId);

  const focus = family.find(m => m.id === focusPersonId);
  const target = family.find(m => m.id === targetId);
  if (!focus || !target) return "";

  const direct = getDirectKinshipRole(focus, target);
  if (direct) return renderKinshipString(direct.role, direct.isBio, focus, target);

  if (focus.spouseId) {
    const spouse = family.find(m => m.id === focus.spouseId);
    if (spouse) {
      const relToSpouse = getDirectKinshipRole(spouse, target);
      if (relToSpouse) {
        const r = relToSpouse.role;
        if (r === 'FATHER') return "మామగారు (Mamagaru)";
        if (r === 'MOTHER') return "అత్తగారు / అత్త (Atthagaru)";
        if (r === 'PATERNAL_GRANDFATHER' || r === 'MATERNAL_GRANDFATHER') return "తాతగారు / తాతయ్య (Taatayya)";
        if (r === 'MATERNAL_GRANDMOTHER') return "నానమ్మ (Nanamma)";
        if (r === 'PATERNAL_GRANDMOTHER') return "అమ్మమ్మ (Ammamma)";

        if (focus.gender === 'female') {
          if (r === 'BROTHER') return isOlder(target, spouse) ? "బావగారు (Bavagaru)" : "మరిది (Maridi)";
          if (r === 'SISTER') return isOlder(target, spouse) ? "వదిన (Vadina)" : "ఆడబిడ్డ (Aadabidda)";
        } else {
          if (r === 'BROTHER') return isOlder(target, spouse) ? "బావగారు (Bavagaru)" : "బావమరిది (Bavamariidi)";
          if (r === 'SISTER') return isOlder(target, spouse) ? "వదిన (Vadina)" : "మరదలు (Maradalu)";
        }

        if (r === 'SISTER_HUSBAND') return isOlder(target, spouse) ? "బావగారు (Bavagaru)" : "బావగారు / మరిది (Bavagaru / Maridi)";
        if (r === 'BROTHER_WIFE') return isOlder(target, spouse) ? "వదిన (Vadina)" : "మరదలు (Maradalu)";

        if (r === 'MENALLUDU') return "మేనల్లుడు (Menalludu)";
        if (r === 'MENAKODALU') return "మేనకోడలు (Menakodalu)";
        if (r === 'SON') return "కొడుకు (Koduku)";
        if (r === 'DAUGHTER') return "కూతురు (Kooturu)";

        if (r === 'CROSS_MALE_COUSIN') {
          return focus.gender === 'female' 
            ? (isOlder(target, spouse) ? "బావగారు (Bavagaru)" : "మరిది (Maridi)")
            : (isOlder(target, spouse) ? "బావ (Bava)" : "బావమరిది (Bavamariidi)");
        }
        if (r === 'CROSS_FEMALE_COUSIN') {
          return focus.gender === 'female'
            ? (isOlder(target, spouse) ? "వదిన (Vadina)" : "ఆడబిడ్డ (Aadabidda)")
            : (isOlder(target, spouse) ? "వదిన (Vadina)" : "మరదలు (Maradalu)");
        }
      }
    }
  }

  const mySiblings = family.filter(m => areSiblings(focus, m));
  for (let sib of mySiblings) {
    if (sib.spouseId) {
      const sibSpouse = family.find(m => m.id === sib.spouseId);
      if (sibSpouse) {
        if (sibSpouse.id === target.id) {
          return isOlder(sibSpouse, focus) ? "బావ (Bava)" : "మరిది (Maridi)";
        }
        if (getAllParents(target).some(p => p.id === sib.id || p.id === sibSpouse.id)) {
          return target.gender === 'male' ? "మేనల్లుడు (Menalludu)" : "మేనకోడలు (Menakodalu)";
        }
        const rArjun = getDirectKinshipRole(sibSpouse, target);
        if (rArjun) {
          const r = rArjun.role;
          if (r === 'FATHER') return "మామగారు (Mamagaru)";
          if (r === 'MOTHER') return "అత్తగారు (Attagaru)";
          if (r === 'BROTHER') return isOlder(target, focus) ? "బావ (Bava)" : "మరిది (Maridi)";
          if (r === 'SISTER') return isOlder(target, focus) ? "వదిన (Vadina)" : "మరదలు (Maradalu)";
          if (r === 'PATERNAL_GRANDFATHER' || r === 'MATERNAL_GRANDFATHER') return "తాతయ్య (Taatayya)";
          if (r === 'PATERNAL_GRANDMOTHER') return "నానమ్మ (Nanamma)";
          if (r === 'MATERNAL_GRANDMOTHER') return "అమ్మమ్మ (Ammamma)";
        }

        const arjunMother = getAllParents(sibSpouse).find(p => p.gender === 'female');
        if (arjunMother) {
          if (areSiblings(arjunMother, target) && target.gender === 'male') return "బాబాయ్ (Babai)";
          if (target.spouseId) {
            const sp = family.find(m => m.id === target.spouseId);
            if (sp && areSiblings(arjunMother, sp) && sp.gender === 'male') return "పిన్ని (Pinni)";
            if (sp && areSiblings(arjunMother, sp) && sp.gender === 'female') return target.gender === 'male' ? "మామయ్య (Mamayya)" : "అత్త (Atta)";
          }
          if (areSiblings(arjunMother, target) && target.gender === 'female') {
            return isOlder(target, arjunMother) ? "పెద్దమ్మ (Peddamma)" : "అత్తయ్య (Attayya)";
          }

          const targetParents = getAllParents(target);
          for (let tp of targetParents) {
            if (areSiblings(arjunMother, tp) && tp.gender === 'male') {
              return target.gender === 'male' 
                ? (isOlder(target, focus) ? "అన్నయ్య (Annayya)" : "తమ్ముడు (Tammudu)")
                : (isOlder(target, focus) ? "అక్క (Akka)" : "చెల్లి (Chelli)");
            }
            if (areSiblings(arjunMother, tp) && tp.gender === 'female') {
              return target.gender === 'male'
                ? (isOlder(target, focus) ? "బావ (Bava)" : "మరిది (Maridi)")
                : (isOlder(target, focus) ? "వదిన (Vadina)" : "మరదలు (Maradalu)");
            }
          }
        }
      }
    }
  }

  if (target.spouseId) {
    const tSpouse = family.find(m => m.id === target.spouseId);
    if (tSpouse) {
      const sRelStr = computeKinship(tSpouse.id, new Set(visited));
      if (sRelStr.includes("మేనల్లుడు") || sRelStr.includes("కొడుకు")) {
        return target.gender === 'female' ? "కోడలు (Kodalu)" : "అల్లుడు (Alludu)";
      }
      if (sRelStr.includes("మేనకోడలు") || sRelStr.includes("కూతురు")) {
        return target.gender === 'male' ? "అల్లుడు (Alludu)" : "కోడలు (Kodalu)";
      }
      if (sRelStr.includes("మనవడు")) return "మనమకోడలు (Manamakodalu)";
      if (sRelStr.includes("మనవరాలు")) return "మనమఅల్లుడు (Manama'alludu)";
      if (sRelStr.includes("బావగారు") || sRelStr.includes("బావ")) return isOlder(target, focus) ? "వదిన (Vadina)" : "మరదలు (Maradalu)";
    }
  }

  for (let p of getAllParents(target)) {
    const pRelStr = computeKinship(p.id, new Set(visited));
    if (pRelStr.includes("కొడుకు") || pRelStr.includes("కూతురు") || pRelStr.includes("మేనల్లుడు") || pRelStr.includes("మేనకోడలు")) {
      return target.gender === 'male' ? "మనవడు (Manavadu)" : "మనవరాలు (Manavaralu)";
    }
    if (pRelStr.includes("మనవడు") || pRelStr.includes("మనవరాలు")) {
      return target.gender === 'male' ? "మునిమనవడు (Munimanavadu)" : "మునిమనవరాలు (Munimanavaralu)";
    }
  }

  const allRelatives = family.filter(m => m.id !== focus.id);
  for (let rel of allRelatives) {
    const relStr = computeKinship(rel.id, new Set(visited));
    if (relStr.includes("కోడలు") || relStr.includes("అల్లుడు") || relStr.includes("మనమకోడలు")) {
      if (getAllParents(rel).some(p => p.id === target.id)) {
        return target.gender === 'male' ? "వియ్యంకుడు (Viyyankudu)" : "వియ్యపురాలు (Viyyaralu)";
      }
      if (areSiblings(rel, target)) {
        return target.gender === 'female' ? "కోడలు వరుస (Kodalu)" : "అల్లుడు (Alludu)";
      }
    }
    if (relStr.includes("ఆడబిడ్డ") || relStr.includes("బావగారు") || relStr.includes("మరిది")) {
      if (getAllParents(rel).some(p => p.id === target.id)) {
        return target.gender === 'male' ? "వియ్యంకుడు (Viyyankudu)" : "వియ్యపురాలు (Viyyaralu)";
      }
    }
  }

  const focusChildren = family.filter(m => getAllParents(m).some(p => p.id === focus.id || (focus.spouseId && p.id === focus.spouseId)));
  for (let ch of focusChildren) {
    if (ch.spouseId) {
      const chSpouse = family.find(m => m.id === ch.spouseId);
      if (chSpouse) {
        if (getAllParents(chSpouse).some(p => p.id === target.id)) {
          return target.gender === 'male' ? "వియ్యంకుడు (Viyyankudu)" : "వియ్యపురాలు (Viyyaralu)";
        }
        if (areSiblings(chSpouse, target) && target.gender === 'female') return "కోడలు (Kodalu)";
        const spouseSisters = family.filter(m => areSiblings(chSpouse, m) && m.gender === 'female');
        if (spouseSisters.some(s => s.spouseId === target.id)) return "కొడుకు (Koduku)";
        if (areSiblings(chSpouse, target) && target.gender === 'male') return "అల్లుడు (Alludu)";
        const spouseBrothers = family.filter(m => areSiblings(chSpouse, m) && m.gender === 'male');
        if (spouseBrothers.some(b => b.spouseId === target.id)) return "కూతురు (Kooturu)";
      }
    }
  }

  return "చుట్టరికం (Relative)";
}

function renderKinshipString(role, isBio, focus, target) {
  const tag = isBio ? " [సొంత]" : "";

  if (role === 'SPOUSE') return target.gender === 'female' ? `భార్య (Bharya)${tag}` : `భర్త (Bhartha)${tag}`;
  if (role === 'FATHER') return `తండ్రి / నాన్న (Tandri / Nanna)${tag}`;
  if (role === 'MOTHER') return `తల్లి / అమ్మ (Talli / Amma)${tag}`;
  if (role === 'SON') return `కొడుకు (Koduku)${tag}`;
  if (role === 'DAUGHTER') return `కూతురు (Kooturu)${tag}`;
  if (role === 'BROTHER') return isOlder(target, focus) ? `అన్నయ్య (Annayya)${tag}` : `తమ్ముడు (Tammudu)${tag}`;
  if (role === 'SISTER') return isOlder(target, focus) ? `అక్క (Akka)${tag}` : `చెల్లి (Chelli)${tag}`;

  if (role === 'MAMAGARU') return "మామగారు (Mamagaru)";
  if (role === 'ATTAGARU') return "అత్తగారు / అత్త (Atthagaru)";
  if (role === 'KODALU') return "కోడలు (Kodalu)";
  if (role === 'ALLUDU') return "అల్లుడు (Alludu)";
  if (role === 'MENALLUDU') return "మేనల్లుడు (Menalludu)";
  if (role === 'MENAKODALU') return "మేనకోడలు (Menakodalu)";

  if (role === 'WIFE_BROTHER') return isOlder(target, focus) ? "బావ (Bava)" : "బావమరిది (Bavamariidi)";
  if (role === 'WIFE_SISTER') return isOlder(target, focus) ? "వదిన (Vadina)" : "మరదలు (Maradalu)";
  if (role === 'HUSBAND_BROTHER') return isOlder(target, focus) ? "బావగారు (Bavagaru)" : "మరిది (Maridi)";
  if (role === 'HUSBAND_SISTER') return "ఆడబిడ్డ (Aadabidda)";

  if (role === 'BROTHER_WIFE') return isOlder(target, focus) ? "వదిన (Vadina)" : "మరదలు (Maradalu)";
  if (role === 'SISTER_HUSBAND') return isOlder(target, focus) ? "బావగారు (Bavagaru)" : "బావ / మరిది (Bavagaru / Maridi)";

  if (role === 'PATERNAL_GRANDFATHER' || role === 'MATERNAL_GRANDFATHER') return `తాతయ్య (Taatayya)${tag}`;
  if (role === 'PATERNAL_GRANDMOTHER') return `నానమ్మ (Nanamma)${tag}`;
  if (role === 'MATERNAL_GRANDMOTHER') return `అమ్మమ్మ (Ammamma)${tag}`;

  if (role === 'PEDDANANNA') return "పెద్దనాన్న (Peddananna)";
  if (role === 'BABAI') return "బాబాయ్ (Babai)";
  if (role === 'PEDDAMMA') return "పెద్దమ్మ (Peddamma)";
  if (role === 'PINNI') return "పిన్ని (Pinni)";
  if (role === 'MENATTHA') return "మేనత్త / అత్తయ్య (Menattha)";
  if (role === 'ATTAYYA') return "అత్తయ్య (Attayya)";
  if (role === 'MENAMAMA') return "మేనమామ / మామయ్య (Menamama)";
  if (role === 'MAMAYYA') return "మామయ్య (Mamayya)";

  if (role === 'CROSS_MALE_COUSIN') {
    return focus.gender === 'female' 
      ? (isOlder(target, focus) ? "బావగారు (Bavagaru)" : "మరిది (Maridi)")
      : (isOlder(target, focus) ? "బావ (Bava)" : "బావమరిది (Bavamariidi)");
  }
  if (role === 'CROSS_FEMALE_COUSIN') {
    return focus.gender === 'female'
      ? (isOlder(target, focus) ? "వదిన (Vadina)" : "ఆడబిడ్డ (Aadabidda)")
      : (isOlder(target, focus) ? "వదిన (Vadina)" : "మరదలు (Maradalu)");
  }

  return "చుట్టరికం (Relative)";
}

function setFocusPerson(id) {
  focusPersonId = id;
  persistFamilyData();
  updateHeaderInputs();
  renderTree();
}

function deleteMember(id) {
  const person = family.find(m => m.id === id);
  if (!person) return;

  if (!confirm(`Are you sure you want to delete ${person.name}?`)) return;

  if (person.spouseId) {
    const spouse = family.find(m => m.id === person.spouseId);
    if (spouse) {
      spouse.spouseId = null;
      spouse.anniversary = null;
    }
  }

  family.forEach(m => {
    if (m.parentIds && m.parentIds.includes(id)) {
      m.parentIds = m.parentIds.filter(pId => pId !== id);
    }
  });

  family = family.filter(m => m.id !== id);

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
    initializeApp().then(() => resetZoom());
  }
}

function calculateAgeFromDob(dobStr) {
  if (!dobStr) return "";
  const birth = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
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
  const birthYear = currentYear - ageVal;
  dobInput.value = `${birthYear}-01-01`;
}

const svg = d3.select("#treeCanvas");
const container = svg.append("g");
const zoom = d3.zoom().scaleExtent([0.15, 2.5]).on("zoom", (e) => container.attr("transform", e.transform));
svg.call(zoom);

function getRootPerson() {
  return family.find(d => (d.parentIds || []).length === 0 && (!d.spouseId || d.gender === "male" || !family.find(m => m.id === d.spouseId))) || family[0];
}

function updateHeaderInputs() {
  const root = getRootPerson();
  if (root) {
    document.getElementById("mainPersonInput").value = root.name;
  }
  const focus = family.find(m => m.id === focusPersonId) || root;
  if (focus) {
    document.getElementById("focusStatus").innerText = focus.name;
  }
}

function saveMainPersonName() {
  const input = document.getElementById("mainPersonInput").value.trim();
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
  const cardMap = new Map();
  const visited = new Set();
  const units = [];

  data.forEach(m => {
    if (visited.has(m.id)) return;
    const spouse = m.spouseId ? data.find(x => x.id === m.spouseId) : null;
    const primary = (spouse && m.gender === "female" && spouse.gender === "male") ? spouse : m;
    const secondary = primary === m ? spouse : m;

    const card = {
      id: `card_${primary.id}`,
      primary,
      secondary,
      children: []
    };
    cardMap.set(primary.id, card);
    if (secondary) cardMap.set(secondary.id, card);
    units.push(card);

    visited.add(primary.id);
    if (secondary) visited.add(secondary.id);
  });

  const genMap = new Map();
  function getGen(mId, visitedTrace = new Set()) {
    if (visitedTrace.has(mId)) return 0;
    visitedTrace.add(mId);
    const m = data.find(x => x.id === mId);
    if (!m || !m.parentIds || m.parentIds.length === 0) return 0;
    const parentGens = m.parentIds.map(p => getGen(p, new Set(visitedTrace)));
    return Math.max(...parentGens) + 1;
  }

  units.forEach(u => {
    const g1 = getGen(u.primary.id);
    const g2 = u.secondary ? getGen(u.secondary.id) : 0;
    genMap.set(u.id, Math.max(g1, g2));
  });

  const genBuckets = new Map();
  units.forEach(u => {
    const g = genMap.get(u.id) || 0;
    if (!genBuckets.has(g)) genBuckets.set(g, []);
    genBuckets.get(g).push(u);
  });

  const cardsWithPos = [];
  const CARD_WIDTH = 350;
  const X_GAP = 60;
  const Y_GAP = 270;

  genBuckets.forEach((cardsInGen, g) => {
    const totalWidth = cardsInGen.length * CARD_WIDTH + (cardsInGen.length - 1) * X_GAP;
    const startX = -totalWidth / 2 + CARD_WIDTH / 2;
    cardsInGen.forEach((card, idx) => {
      card.x = startX + idx * (CARD_WIDTH + X_GAP);
      card.y = g * Y_GAP;
      cardsWithPos.push(card);
    });
  });

  const links = [];
  cardsWithPos.forEach(childCard => {
    const pParents = childCard.primary.parentIds || [];
    if (pParents.length > 0) {
      const parentCard = cardsWithPos.find(c => c.primary.id === pParents[0] || (c.secondary && c.secondary.id === pParents[0]));
      if (parentCard) {
        links.push({
          source: { x: parentCard.x, y: parentCard.y + 190 },
          target: { x: childCard.x - 60, y: childCard.y - 25 }
        });
      }
    }
    if (childCard.secondary) {
      const mParents = childCard.secondary.parentIds || [];
      if (mParents.length > 0) {
        const mParentCard = cardsWithPos.find(c => c.primary.id === mParents[0] || (c.secondary && c.secondary.id === mParents[0]));
        if (mParentCard) {
          links.push({
            source: { x: mParentCard.x, y: mParentCard.y + 190 },
            target: { x: childCard.x + 60, y: childCard.y - 25 }
          });
        }
      }
    }
  });

  return { cards: cardsWithPos, links };
}

function renderTree() {
  container.selectAll("*").remove();
  const { cards, links } = buildGraphLayout(family);

  container.selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link-line")
    .attr("d", d3.linkVertical().x(d => d.x).y(d => d.y));

  const nodes = container.selectAll(".node")
    .data(cards)
    .enter()
    .append("g")
    .attr("class", "node-card")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  nodes.append("foreignObject")
    .attr("width", 350)
    .attr("height", 215)
    .attr("x", -175)
    .attr("y", -30)
    .html(d => {
      const m = d.primary;
      const spouse = d.secondary;

      const isSpouseActive = spouse && focusPersonId === spouse.id;
      const activePerson = isSpouseActive ? spouse : m;
      const activePersonId = activePerson.id;

      const relationM = computeKinship(m.id);
      const relationSpouse = spouse ? computeKinship(spouse.id) : "";
      const mAge = calculateAgeFromDob(m.dob);
      const spouseAge = spouse ? calculateAgeFromDob(spouse.dob) : "";

      const activeAge = calculateAgeFromDob(activePerson.dob);
      const isChild = (activeAge !== "" && activeAge < 18);
      const hasFather = getAllParents(activePerson).some(p => p.gender === "male");
      const hasMother = getAllParents(activePerson).some(p => p.gender === "female");

      const isMainActive = focusPersonId === m.id || (spouse && focusPersonId === spouse.id);

      return `
        <div class="bg-slate-800 border ${isMainActive ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-2xl' : 'border-slate-700 shadow-xl'} rounded-2xl transition p-3.5 flex flex-col justify-between h-full">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-start gap-2.5 p-1.5 rounded-xl transition ${!isSpouseActive ? 'bg-slate-700/80 ring-1 ring-indigo-400 shadow-sm' : 'opacity-70 hover:opacity-100 hover:bg-slate-700/40'}" onclick="setFocusPerson('${m.id}')">
              <div class="w-8 h-8 rounded-full ${m.gender === 'female' ? 'bg-rose-600' : 'bg-indigo-600'} flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                ${m.gender === 'female' ? FEMALE_ICON : MALE_ICON}
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <h4 class="font-extrabold text-white text-xs truncate max-w-[85px]">${m.name}</h4>
                  <button onclick="event.stopPropagation(); openEditModal('${m.id}')" class="text-slate-400 hover:text-indigo-400 text-[11px]" title="Edit">✏️</button>
                  <button onclick="event.stopPropagation(); deleteMember('${m.id}')" class="text-slate-400 hover:text-rose-400 text-[11px]" title="Delete Person">🗑️</button>
                </div>
                <p class="text-[10px] text-indigo-300 font-bold leading-tight mt-0.5">${relationM}</p>
                <p class="text-[9px] text-slate-400 font-medium">${mAge !== "" ? `Age: ${mAge}y` : (m.dob || 'DOB —')}</p>
              </div>
            </div>

            ${spouse ? `
              <div class="flex items-start gap-2.5 p-1.5 rounded-xl transition border-l pl-2 border-slate-700 ${isSpouseActive ? 'bg-slate-700/80 ring-1 ring-rose-400 shadow-sm' : 'opacity-70 hover:opacity-100 hover:bg-slate-700/40'}" onclick="event.stopPropagation(); setFocusPerson('${spouse.id}')">
                <div class="text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button onclick="event.stopPropagation(); deleteMember('${spouse.id}')" class="text-slate-400 hover:text-rose-400 text-[11px]" title="Delete Person">🗑️</button>
                    <button onclick="event.stopPropagation(); openEditModal('${spouse.id}')" class="text-slate-400 hover:text-indigo-400 text-[11px]" title="Edit">✏️</button>
                    <h4 class="font-extrabold text-white text-xs truncate max-w-[80px]">${spouse.name}</h4>
                  </div>
                  <p class="text-[10px] text-rose-300 font-bold leading-tight mt-0.5">${relationSpouse}</p>
                  <p class="text-[8px] text-slate-400 font-medium">${spouseAge !== "" ? `Age: ${spouseAge}y` : (spouse.dob || 'DOB —')}</p>
                </div>
                <div class="w-8 h-8 rounded-full ${spouse.gender === 'female' ? 'bg-rose-600' : 'bg-indigo-600'} flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                  ${spouse.gender === 'female' ? FEMALE_ICON : MALE_ICON}
                </div>
              </div>
            ` : ''}
          </div>

          <div class="flex justify-between items-center px-2 text-[9px] text-slate-300 bg-slate-900/80 py-1 rounded-md border border-slate-700/80">
            <span>Actions for: <strong class="text-indigo-300 font-bold">${activePerson.name}</strong></span>
            <span class="text-[8px] text-slate-400 font-normal">(Tap spouse above to switch)</span>
          </div>

          <div class="grid grid-cols-4 gap-1.5 pt-0.5 text-[9px] font-bold">
            <button onclick="openAddModal('${activePersonId}', 'father')" class="bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white py-1 rounded-md border border-slate-600 shadow-sm transition text-center ${hasFather ? 'opacity-30 pointer-events-none' : ''}">+ Nanna</button>
            <button onclick="openAddModal('${activePersonId}', 'mother')" class="bg-slate-700 hover:bg-rose-600 text-slate-200 hover:text-white py-1 rounded-md border border-slate-600 shadow-sm transition text-center ${hasMother ? 'opacity-30 pointer-events-none' : ''}">+ Amma</button>
            <button onclick="openAddModal('${activePersonId}', 'spouse')" class="bg-slate-700 hover:bg-purple-600 text-slate-200 hover:text-white py-1 rounded-md border border-slate-600 shadow-sm transition text-center ${spouse || isChild ? 'hidden' : ''}">+ Spouse</button>
            <button onclick="openAddModal('${activePersonId}', 'child')" class="bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white py-1 rounded-md border border-slate-600 shadow-sm transition text-center ${isChild ? 'col-span-2' : ''}">+ Child</button>
          </div>

          <div class="grid grid-cols-2 gap-1.5 text-[9px] font-bold">
            <button onclick="openAddModal('${activePersonId}', 'brother')" class="bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white py-1 rounded-md border border-slate-600 shadow-sm transition text-center flex items-center justify-center gap-1">
              <span>+ Brother</span> <span class="text-[8px] opacity-75 font-normal">(అన్న/తమ్ముడు)</span>
            </button>
            <button onclick="openAddModal('${activePersonId}', 'sister')" class="bg-slate-700 hover:bg-pink-600 text-slate-200 hover:text-white py-1 rounded-md border border-slate-600 shadow-sm transition text-center flex items-center justify-center gap-1">
              <span>+ Sister</span> <span class="text-[8px] opacity-75 font-normal">(అక్క/చెల్లి)</span>
            </button>
          </div>
        </div>
      `;
    });

  updateEventsList();
}

function openEditModal(memberId) {
  const member = family.find(m => m.id === memberId);
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
  const member = family.find(m => m.id === id);
  if (!member) return;

  member.name = document.getElementById("editFullName").value.trim();
  member.gender = document.getElementById("editGender").value;
  member.dob = document.getElementById("editDob").value || null;

  const anniversary = document.getElementById("editAnniversary").value || null;
  member.anniversary = anniversary;

  if (member.spouseId) {
    const spouse = family.find(s => s.id === member.spouseId);
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

  const target = family.find(m => m.id === targetId);
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

  document.getElementById("formDob").value = "";
  document.getElementById("formAge").value = "";

  document.getElementById("anniversaryGroup").classList.toggle("hidden", type !== "spouse");
  document.getElementById("addModal").classList.remove("hidden");
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

  const newId = String(Date.now());
  const newMember = {
    id: newId,
    name: name,
    gender: gender,
    dob: dob || null,
    spouseId: null,
    anniversary: null,
    parentIds: []
  };

  const target = family.find(f => f.id === targetId);

  if (type === "child") {
    newMember.parentIds = target.spouseId ? [target.id, target.spouseId] : [target.id];
  } else if (type === "spouse") {
    newMember.spouseId = targetId;
    newMember.anniversary = anniversary || null;
    target.spouseId = newId;
    target.anniversary = anniversary || null;
  } else if (type === "father" || type === "mother") {
    if (!target.parentIds) target.parentIds = [];
    
    const existingParent = getAllParents(target).find(p => type === "father" ? p.gender === "female" : p.gender === "male");
    if (existingParent) {
      newMember.spouseId = existingParent.id;
      existingParent.spouseId = newId;
    }

    target.parentIds.push(newId);
  } else if (type === "brother" || type === "sister") {
    const parents = getAllParents(target);
    if (parents.length > 0) {
      newMember.parentIds = parents.map(p => p.id);
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
  persistFamilyData();
  closeModal("addModal");
  document.getElementById("memberForm").reset();
  renderTree();
  updateHeaderInputs();
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
  list.innerHTML = "";
  const events = [];

  family.forEach(m => {
    if (checkUpcoming(m.dob)) {
      events.push(`🎂 <strong>${m.name}</strong>'s Birthday (${m.dob.slice(5)})`);
    }
    if (m.anniversary && checkUpcoming(m.anniversary)) {
      const spouse = family.find(s => s.id === m.spouseId);
      events.push(`💍 <strong>${m.name} & ${spouse ? spouse.name : ''}</strong>'s Anniversary (${m.anniversary.slice(5)})`);
    }
  });

  const unique = [...new Set(events)];
  if (unique.length === 0) {
    list.innerHTML = `<p class="text-slate-400">No events in next 30 days.</p>`;
  } else {
    unique.forEach(e => {
      const item = document.createElement("div");
      item.className = "p-2 bg-slate-700/60 rounded-lg border border-slate-600";
      item.innerHTML = e;
      list.appendChild(item);
    });
  }
}

function handleSearch(term) {
  if (!term.trim()) return;
  const found = family.find(f => f.name.toLowerCase().includes(term.toLowerCase()));
  if (found) {
    setFocusPerson(found.id);
  }
}

function resetZoom() {
  const w = window.innerWidth || document.documentElement.clientWidth || 800;
  const scale = w < 768 ? 0.45 : 0.8;
  const startX = w / 2;
  const startY = w < 768 ? 40 : 80;

  svg.transition().duration(500).call(
    zoom.transform,
    d3.zoomIdentity.translate(startX, startY).scale(scale)
  );
}

function toggleEventsPanel() {
  document.getElementById("eventsDrawer").classList.toggle("hidden");
}

window.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});