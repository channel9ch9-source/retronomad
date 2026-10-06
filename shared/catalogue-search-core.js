import { normalizeCatalogueTitle } from "./catalogue-core.js";

const ROMAN_NUMERALS=Object.freeze({
  ii:"2",iii:"3",iv:"4",v:"5",vi:"6",vii:"7",viii:"8",ix:"9",x:"10"
});
const STOP_WORDS=new Set(["the","of","and","a","an","to","for","in","on","vs","versus","with"]);
const PLATFORM_ORDER=Object.freeze({PS1:0,PS2:1,Dreamcast:2});

export function numeralSearchVariant(value){
  return normalizeCatalogueTitle(value)
    .split(" ")
    .filter(Boolean)
    .map(token=>ROMAN_NUMERALS[token]||token)
    .join(" ");
}

export function catalogueAcronym(value){
  return numeralSearchVariant(value)
    .split(" ")
    .filter(token=>token&&!STOP_WORDS.has(token))
    .map(token=>/^\d+$/.test(token)?token:token[0])
    .join("");
}

function tokensInOrder(queryTokens,valueTokens){
  if(!queryTokens.length)return false;
  let index=0;
  for(const token of valueTokens){
    const q=queryTokens[index];
    if(!q)break;
    if(token.startsWith(q)||(q.startsWith(token)&&token.length>=3))index++;
  }
  return index===queryTokens.length;
}

export function boundedLevenshtein(a,b,maxDistance){
  if(a===b)return 0;
  if(Math.abs(a.length-b.length)>maxDistance)return maxDistance+1;
  let previous=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const current=[i];
    let rowMin=i;
    for(let j=1;j<=b.length;j++){
      const value=Math.min(
        current[j-1]+1,
        previous[j]+1,
        previous[j-1]+(a[i-1]===b[j-1]?0:1)
      );
      current.push(value);
      if(value<rowMin)rowMin=value;
    }
    if(rowMin>maxDistance)return maxDistance+1;
    previous=current;
  }
  return previous[b.length];
}

function typoAllowance(length){
  if(length<=7)return 1;
  if(length<=14)return 2;
  return 3;
}

function scoreSearchValue(rawValue,query,{title=false,allowTypos=true}={}){
  const normalized=normalizeCatalogueTitle(rawValue);
  const numeral=numeralSearchVariant(rawValue);
  if(!normalized)return null;

  const q=query.normalized;
  const qNumeral=query.numeral;
  const qCompact=query.compact;
  const qTokens=query.tokens;
  const scores=[];

  if(normalized===q||numeral===qNumeral){
    scores.push({score:title?1000:960,reason:title?"exact-title":"exact-alias"});
  }

  if(qNumeral&&numeral!==qNumeral&&numeral.startsWith(qNumeral)){
    scores.push({score:title?900:860,reason:title?"title-prefix":"alias-prefix"});
  }

  if(qNumeral&&numeral.includes(qNumeral)&&!numeral.startsWith(qNumeral)){
    scores.push({score:title?790:750,reason:title?"title-contains":"alias-contains"});
  }

  if(qCompact.length>=2){
    const acronym=catalogueAcronym(rawValue);
    if(acronym===qCompact){
      scores.push({score:title?940:920,reason:title?"title-acronym":"alias-acronym"});
    }else if(qCompact.length>=3&&acronym.startsWith(qCompact)){
      scores.push({score:title?845:825,reason:title?"title-acronym-prefix":"alias-acronym-prefix"});
    }
  }

  const valueTokens=numeral.split(" ").filter(Boolean);
  if(qTokens.length>=2&&tokensInOrder(qTokens,valueTokens)){
    scores.push({score:title?735:710,reason:title?"title-token-subsequence":"alias-token-subsequence"});
  }

  if(allowTypos&&qNumeral.length>=4){
    const maxDistance=typoAllowance(qNumeral.length);
    const fullDistance=boundedLevenshtein(qNumeral,numeral,maxDistance);
    if(fullDistance<=maxDistance){
      scores.push({
        score:(title?670:650)-fullDistance*25,
        reason:title?"title-typo":"alias-typo",
        editDistance:fullDistance
      });
    }

    if(numeral.length>qNumeral.length+1){
      const prefix=numeral.slice(0,qNumeral.length);
      const prefixDistance=boundedLevenshtein(qNumeral,prefix,maxDistance);
      if(prefixDistance<=maxDistance){
        scores.push({
          score:(title?625:605)-prefixDistance*25,
          reason:title?"title-prefix-typo":"alias-prefix-typo",
          editDistance:prefixDistance
        });
      }
    }
  }

  if(!scores.length)return null;
  scores.sort((a,b)=>b.score-a.score||(a.editDistance??0)-(b.editDistance??0));
  return {...scores[0],matchedText:String(rawValue)};
}

function coverageOrder(value){
  if(value==="PALSCOUT_DEEP")return 0;
  if(value==="PALSCOUT_PARTIAL")return 1;
  return 2;
}

export function rankCatalogueMatches(index,query,options={}){
  const normalized=normalizeCatalogueTitle(query);
  if(!normalized)return [];
  const numeral=numeralSearchVariant(query);
  const prepared={
    normalized,
    numeral,
    compact:numeral.replace(/\s+/g,""),
    tokens:numeral.split(" ").filter(Boolean)
  };
  const platform=String(options.platform||"");
  const limit=Math.max(1,Math.min(50,Number(options.limit||8)));
  const allowTypos=options.allowTypos!==false;
  const rows=[];

  for(const game of index||[]){
    if(platform&&game.platform!==platform)continue;
    let best=scoreSearchValue(game.title,prepared,{title:true,allowTypos});
    for(const alias of game.aliases||[]){
      const score=scoreSearchValue(alias,prepared,{title:false,allowTypos});
      if(score&&(!best||score.score>best.score))best=score;
    }
    if(!best)continue;
    rows.push({
      game,
      score:best.score,
      reason:best.reason,
      matchedText:best.matchedText,
      editDistance:best.editDistance??null
    });
  }

  rows.sort((a,b)=>
    b.score-a.score||
    coverageOrder(a.game.coverage)-coverageOrder(b.game.coverage)||
    a.game.title.length-b.game.title.length||
    (PLATFORM_ORDER[a.game.platform]??99)-(PLATFORM_ORDER[b.game.platform]??99)||
    a.game.title.localeCompare(b.game.title)
  );
  return rows.slice(0,limit);
}

export function resolveCatalogueQuery(index,query,options={}){
  const ranked=rankCatalogueMatches(index,query,{...options,limit:5});
  if(!ranked.length)return {status:"none",query:String(query||""),ranked:[]};

  const top=ranked[0], second=ranked[1]||null;
  const tied=Boolean(second&&second.score===top.score);
  const exactLike=top.score>=920;
  const fuzzySafe=top.score>=620&&(!second||top.score-second.score>=35);

  if(tied){
    return {status:"ambiguous",query:String(query||""),top,ranked};
  }
  if(exactLike||fuzzySafe){
    return {
      status:top.editDistance!=null?"corrected":"resolved",
      query:String(query||""),
      top,
      ranked
    };
  }
  return {status:"ambiguous",query:String(query||""),top,ranked};
}
