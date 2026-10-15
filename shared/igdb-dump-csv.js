// Streaming RFC 4180-style CSV parsing for private IGDB Data Dump development.
// This module makes NO network requests, writes NO files and cannot publish data.
export async function* parseIgdbCsv(chunks,{requiredColumns=[],maxFieldChars=1_000_000,maxColumns=512}={}){
 let header=null,fields=[],field="",state="START",skipLf=false,firstChar=true,line=1,recordCount=0;
 const append=c=>{
  field+=c;
  if(field.length>maxFieldChars)throw new Error("CSV field exceeds safe length limit");
 };
 const endField=()=>{
  fields.push(field);
  if(fields.length>maxColumns)throw new Error("CSV has more columns than allowed");
  field="";state="START";
 };
 const endRecord=()=>{
  endField();
  const cells=fields;fields=[];
  if(cells.length===1&&cells[0]==="")return null;
  if(!header){
   header=cells;
   if(header.some(x=>!x)||new Set(header).size!==header.length)throw new Error("Missing or duplicate CSV headers");
   const absent=requiredColumns.filter(x=>!header.includes(x));
   if(absent.length)throw new Error("Missing required CSV headers: "+absent.join(", "));
   return null;
  }
  if(cells.length!==header.length)throw new Error("Invalid CSV column count near line "+line);
  recordCount++;
  return Object.fromEntries(header.map((key,i)=>[key,cells[i]]));
 };
 for await(const piece of chunks){
  if(typeof piece!=="string")throw new TypeError("CSV stream must use utf8 string chunks");
  for(let c of piece){
   if(firstChar){firstChar=false;if(c==="\uFEFF")continue;}
   if(skipLf){skipLf=false;if(c==="\n")continue;}
   if(state==="QUOTED"){
    if(c==='"'){state="AFTER_QUOTE";}
    else {append(c);if(c==="\n")line++;}
    continue;
   }
   if(state==="AFTER_QUOTE"){
    if(c==='"'){append('"');state="QUOTED";continue;}
    if(c!==","&&c!=="\r"&&c!=="\n")throw new Error("Unexpected character after quoted CSV value near line "+line);
   }else if(state==="START"){
    if(c==='"'){state="QUOTED";continue;}
   }else if(c==='"')throw new Error("Unescaped quote in CSV value near line "+line);
   if(c===","){endField();continue;}
   if(c==="\r"||c==="\n"){
    const record=endRecord();line++;
    if(c==="\r")skipLf=true;
    if(record)yield record;
    continue;
   }
   append(c);state="UNQUOTED";
  }
 }
 if(state==="QUOTED")throw new Error("Unterminated quoted CSV field");
 if(state!=="START"||field.length||fields.length){
  const record=endRecord();if(record)yield record;
 }
 if(!header)throw new Error("CSV is missing a header row");
 if(recordCount===0)throw new Error("CSV has no data rows");
}

export function igdbRef(value,{optional=false}={}){
 const input=String(value??"").trim();
 if(optional&&!input)return null;
 if(!/^[1-9][0-9]*$/.test(input))throw new Error("Invalid IGDB reference");
 const id=Number(input);
 if(!Number.isSafeInteger(id))throw new Error("IGDB reference is not a safe integer");
 return id;
}

export function igdbRefs(value){
 const raw=String(value??"").trim();
 if(!raw||raw==="[]"||raw==="{}")return [];
 let values;
 if(raw.startsWith("[")){
  try{values=JSON.parse(raw);}catch{throw new Error("Invalid IGDB reference array");}
  if(!Array.isArray(values))throw new Error("Invalid IGDB reference array");
 }else if(raw.startsWith("{")){
  // Actual IGDB CSV Data Dumps use PostgreSQL-style numeric array literals:
  // {123,456}, {}. Never eval arbitrary arrays or accept quoted values.
  if(!/^\{\s*(?:[1-9][0-9]*(?:\s*,\s*[1-9][0-9]*)*)?\s*\}$/.test(raw))
   throw new Error("Invalid IGDB numeric brace array");
  values=raw.slice(1,-1).trim()?raw.slice(1,-1).split(",").map(x=>x.trim()):[];
 }else if(/^[1-9][0-9]*$/.test(raw)){
  values=[raw];
 }else throw new Error("Unsupported IGDB reference array encoding");
 return [...new Set(values.map(x=>igdbRef(x)))];
}

export function igdbReleaseYear(value){
 const raw=String(value??"").trim();
 if(!raw)return null;
 let date;
 if(/^-?\d+$/.test(raw)){
  const n=Number(raw);
  if(!Number.isFinite(n))return null;
  date=new Date(Math.abs(n)>100_000_000_000?n:n*1000);
 }else date=new Date(raw);
 const year=date.getUTCFullYear();
 return Number.isInteger(year)&&year>=1980&&year<=2100?year:null;
}
