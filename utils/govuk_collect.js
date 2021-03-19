const convert = require('xml-js');
const fetch   = require('node-fetch');
const uuidv4  = require('uuid/v4');
const $       = require('cheerio');
const { replaceAll } = require('./index');
const db      = require('../models');
const GrantService = require('../services/Grant');
const { sendAdminEmail } = require('./mail');
const CronJob = require('cron').CronJob;

module.exports.cronCollect = () => {
  // new CronJob('00 23 * * */1', function() {
  //   console.log('Start collecting data...');
  //   collect_data();
  // }, null, true, 'America/Los_Angeles');

  new CronJob('15 15 * * *', function() {
    console.log('Start collecting data...');
    collect_data();
  }, null, true, 'Africa/Lagos');

  console.log("Cron Job set");
}

module.exports.instantCollect = () => {
  collect_data();
}

async function collect_data() {
  let logText = "";
  // Collect all data about grants from gov.uk
  let grantsData = await fetchAllGrants();
  grantsData = await fillGrantsData(grantsData);
  
  const source = 'gov.uk';
  const deletedCount = await deleteOutdated(grantsData);
  let createdCount = 0;
  let updatedCount = 0;
  logText += `Deleted ${deletedCount} grants.\n`;
  console.log('logText: ', logText);

  // Add tags to data base
  for (let i = 0; i < grantsData.length; i++) {
    let element = grantsData[i];
    let metadata = element.details.metadata;
    let tagGroups = Object.keys(metadata).map(el => ({title: el}));
    let grantTags = [];

    for (let j = 0; j < tagGroups.length; j++) {
      await db.tag_group
        .findOrCreate({where: {title: tagGroups[j].title}, defaults: {id: uuidv4()}})
        .then(([tag_group]) => tagGroups[j] = tag_group);

      if (Array.isArray(metadata[tagGroups[j].title])) {
        let tags = metadata[tagGroups[j].title];
        tags = tags.map(el => ({title: el}));
        for (let k = 0; k < tags.length; k++) { 
          await db.tag
            .findOrCreate(
              {
                where: {title: tags[k].title, tagGroupId: tagGroups[j].id},
                defaults: {id: uuidv4()}
              }
            )
            .then(([tag]) => tags[k] = tag);
          grantTags = [...grantTags, tags[k]];
        }
      } else if (typeof metadata[tagGroups[j].title] === "string") {
        let tag = metadata[tagGroups[j].title];
        await db.tag
            .findOrCreate(
              {
                where: {title: tag, tagGroupId: tagGroups[j].id},
                defaults: {id: uuidv4()}
              }
            )
            .then(([created_tag]) => tag = created_tag);
          grantTags = [...grantTags, tag];
      }     
    }
    
    // Parsing grant body to gat additional data
    const $body = $.load(element.details.body);
    let rawPrice = $body('#how-much-will-be-paid').next().text();
    if (!rawPrice) {
      rawPrice = $body('#how-much-is-paid').next().text();
    }

    const regExpRes = /([£|\d|.|,]*) (per|for|once)* (.*)/g.exec(rawPrice);
    let parsedPrice = null;
    let parsedUnits = null;

    // If price and price unit was successfully founded     
    if (!!regExpRes && regExpRes.length === 4) {
      parsedPrice = parseFloat(regExpRes[1].replace('£', '').replace(',', '')).toFixed(2);
      parsedUnits = replaceAll(regExpRes[3], '[.|,|(,)]', '')
      .replace("hectare ha", "ha")
      .replace("hectare", "ha")
      .replace("ha", "ha")
      .replace("square metre", "sqm")
      .replace("cubic metre", "cbm")
      .replace("metre m", "m")
      .replace("metre", "m")
      .replace("m", "m")
      .trim();
    }

    const values = {
      web_link: element.web_link,
      api_link: element.api_link,
      body: element.details.body,
      raw_price: rawPrice,
      source,
      parsed_price: isNaN(parsedPrice) ? null : parsedPrice,
      parsed_units: parsedUnits && parsedUnits.length ? parsedUnits : null,
      title: element.title
    };

    // Add grant
    let grantCreated = false;
    await db.grant
      .findOrCreate(
        {
          where: {
            id: element.content_id
          },
          defaults: values
        }
      )
      .then(([grant, created]) => {element = grant; grantCreated = created; });

    if (grantCreated) {
      createdCount++;
    } else {
      updatedCount++;
      db.grant.update(values, {where: {id: element.id}})
    }
    
    // Add grant-tag connection
    for (let j = 0; j < grantTags.length; j++) {
      db.tag_grant
        .findOrCreate({
          where: {grantId: element.id, tagId: grantTags[j].id },
          defaults: {id: uuidv4()}
        });
    }
  }

  logText += `Created ${createdCount} grants.\n Kept up to date ${updatedCount} grants.`;
  sendAdminEmail({subject: `Grants from ${source} were updated.`, html: logText, text: logText});
}

async function deleteOutdated(grantsData) {
  return await GrantService.deleteOutdated(grantsData.map(grant => grant.content_id), "gov.uk");
}

async function fillGrantsData(grants) {
  for (let i = 0; i < grants.length; i++) {
    await fetch(grants[i].api_link)
    .then(res => res.text())
    .then(body => { 
      // console.log(`${i} body.details : `, JSON.parse(body).details );
      const data = JSON.parse(body);
      grants[i].details = data.details;
      grants[i].content_id = data.content_id;
    });
  }

  return grants;
}

async function fetchAllGrants() {
  let res = [];
  let xmlTemp = '';
  let jsonTemp = {};
  let isNextPageExist = true;

  for (let i = 1; isNextPageExist; i++) {
    xml_temp = await fetchGrantPage(i);
    jsonTemp = convert.xml2js(xml_temp, {compact: false});
    jsonTemp = editReceivedData(jsonTemp);
    if (jsonTemp.length) {
      res = [...res, ...jsonTemp];
    } else {
      isNextPageExist = false;
    }
  }

  return res;
}

function editReceivedData(json) {
  json = json.elements[0].elements;
  json = json.filter(element => element.name == 'entry');
  return json.map(element => {
    return {
      id: element.elements[0].elements[0].text,
      updated_at: element.elements[1].elements[0].text,
      web_link: element.elements[2].attributes.href,
      api_link: element.elements[2].attributes.href
        .replace('https://www.gov.uk/', 'https://www.gov.uk/api/content/'),
      title: element.elements[3].elements[0].text,
    }
  });
}


async function fetchGrantPage(page = 1) {
  let res = '';
  await fetch(`https://www.gov.uk/countryside-stewardship-grants.atom?page=${page}`)
    .then(res => res.text())
    .then(body => res = body);
  return res;
}