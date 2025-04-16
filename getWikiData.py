import json, requests, bs4, re

wdIDToValue = {}

def isInData(key, value, data):
    for i in data:
        if i[key] == value:
            return True
    return False

def getWikidataID(item):
    wikipediaAPIUrl = f"https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&titles={item}&format=json&redirects=1"
    wikipediaAPIResponse = requests.get(wikipediaAPIUrl)
    wikidataResults = wikipediaAPIResponse.json()
    for page in wikidataResults["query"]["pages"].values():
        try:
            wikidataID = page["pageprops"]["wikibase_item"]
        except KeyError:
            raise KeyError(f"{item} does not have wikibase_item")
        return wikidataID

def getWikidataValues(wdID, urlCheck):
    valuesList = []
    wikidataAPIUrl = f"https://www.wikidata.org/wiki/Special:EntityData/{wdID}.json"
    wikidataJson = requests.get(wikidataAPIUrl).json()
    urlFromWD = wikidataJson["entities"][wdID]["sitelinks"]["enwiki"]["url"]

    #if urlFromWD != urlCheck:
    #    raise ValueError(f"Wikidata enwiki url is {urlFromWD}, but urlCheck is {urlCheck}")
    #print(wdID)
    wikidataEntity = wikidataJson["entities"][wdID]
    for claim in wikidataEntity["claims"]:
        #instance of, subclass of, field of work, occupation, sex or gender, country, country of citizenship, based on, part of the series
        # form of creative work, country of origin
        preferredClaims = ["P31", "P279", "P101", "P106", "P21", "P17", "P27", "P144", "P179", "P7937", "P495"] 
        if claim in preferredClaims:
            for valueEntry in wikidataEntity["claims"][claim]:
                valueID = valueEntry["mainsnak"]["datavalue"]["value"]["id"]
                value = getWikidataValueFromProp(valueID)
                if "television" in value and "television" not in valuesList:
                    valuesList.append("television")
                if "film" in value and "film" not in valuesList:
                    valuesList.append("film")
                if ("sport" in value or "ball" in value or "boxer" in value or "swim" in value) and "sports" not in valuesList:
                    valuesList.append("sports")
                if value not in valuesList:
                    valuesList.append(value)
    return valuesList
            
def getWikidataValueFromProp(propertyID):
    if propertyID in wdIDToValue:
        return wdIDToValue[propertyID]
    else:
        propIDUrl = f"https://www.wikidata.org/wiki/Special:EntityData/{propertyID}.json"
        propIDdata = requests.get(propIDUrl).json()
        try:
            propIDvalue = propIDdata['entities'][propertyID]['labels']['en']['value']
        except KeyError:
            raise KeyError(f"{propertyID} has problem")
        wdIDToValue[propertyID] = propIDvalue
        return(propIDvalue)



data = []

wikitableUrl = 'https://en.wikipedia.org/wiki/Wikipedia:Top_25_Report/Records'
wikitableResponse = requests.get(wikitableUrl)
wikitableSoup = bs4.BeautifulSoup(wikitableResponse.text, 'html.parser')

allTables = wikitableSoup.find_all('table')

table1 = allTables[1]
table2 = allTables[2]

for table in allTables[1:3]:
    rows = table.find_all('tr')
    for indexRow, row in enumerate(rows):
        if indexRow == 0:
            continue
        cols = row.find_all(['td', 'th'])
        link = f"https://en.wikipedia.org{cols[2].select('a')[0].get('href')}"
        if isInData("title", title, data):
            continue
        wikiEntry = {"link":None, "title": None, "views": None, "description":None, "extract":None, "image":None, "categories":[]}
        title = cols[2].select('a')[0].get('title')
        viewNumber = int("".join(re.findall("\d", cols[4].getText())))
        wikiEntry["title"] = title
        wikiEntry["link"] = link
        wikiEntry["views"] = viewNumber

        wikiSummaryUrl = f'https://en.wikipedia.org/api/rest_v1/page/summary/{title.replace(" ", "_")}'
        wikiSummaryResponse = requests.get(wikiSummaryUrl)
        wikiSummaryJson = wikiSummaryResponse.json()
        wikiEntry["description"] = wikiSummaryJson["description"]
        wikiEntry["extract"] = wikiSummaryJson["extract_html"]
        if "originalimage" in wikiSummaryJson:
            wikiEntry["image"] = wikiSummaryJson["originalimage"]["source"]
        else:
            print(f"{title} has no image")
        
        wdID = getWikidataID(title)
        wikiEntry["categories"] = getWikidataValues(wdID, link)
        data += [wikiEntry]
        print(title)

with open('wikiDataFull.js', 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)

catCount = {}
for wiki in data:
    for category in wiki["categories"]: 
        if category not in catCount:
            catCount[category] = 0
        catCount[category] += 1

for wiki in data:
    for category in wiki["categories"][:]: 
        if catCount[category] < 3:
            wiki["categories"].remove(category)

with open('wikiDataTrimmed.js', 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)