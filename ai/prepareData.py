import jsonlines

def tryExtractJsonlValue(object,key):
    try:
        return object[key]
    except Exception as e:  
        return ""

def load_data_from_jsonl(file_path):
    sentence = ""   
    with jsonlines.open(file_path) as reader:
        for line in reader:
            try:
                name = tryExtractJsonlValue(line, 'name')
                boendekostnad = tryExtractJsonlValue(line, 'Boendekostnad')
                kvadratmeterpris = tryExtractJsonlValue(line, 'Kvadratmeterpris')
                avgift = tryExtractJsonlValue(line, 'Avgift')
                upplatelseform = tryExtractJsonlValue(line, 'Upplåtelseform')
                bostadstyp = tryExtractJsonlValue(line, 'Bostadstyp')
                dagar_på_booli = tryExtractJsonlValue(line, 'Dagar på Booli')
                sidvisningar = tryExtractJsonlValue(line, 'Sidvisningar')
                våning = tryExtractJsonlValue(line, 'Våning')
                brf = tryExtractJsonlValue(line, 'BRF')
                sentence += f"Huset adress är {name}, kostnaden är {boendekostnad}, kvadratmeterpriset är {kvadratmeterpris}, avgiften är {avgift}, upplåtelseformen är {upplatelseform}, bostadstypen är {bostadstyp}, antal dagar på Booli är {dagar_på_booli}, antal sidvisningar är {sidvisningar}, våningen är {våning}, och BRF är {brf}. \n"
            except Exception as e:
                print(f"An error occurred while loading data from JSONL: {str(e)}")
    return sentence

# Usage
file_path = "./rawData/output.jsonl"
data = load_data_from_jsonl(file_path)

# Write data to file
with open("./trainingData/structured.txt", "w") as file:
    file.write(data)

