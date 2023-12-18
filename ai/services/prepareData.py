import jsonlines
import json
import os


def tryExtractJsonlValue(object,key):
    try:
        return object[key]
    except Exception as e:  
        return ""
    

    
def load_list_from_json(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

def normalize_number(price:str):
    if price == "":
        return ""
    
    price = price.replace(",", "")
    price = price.replace(".", "")
    print(price)
    return price


def normalize_link(link:str):
    if link.find("example.com"):
        return ""
    return link


def create_files_from_json(json_data):
    for obj in json_data:
        try:
            file = obj["information"]["adress"].replace("/", " ")
            file_path ="./trainingData/" + file + ".txt"
            information = obj["information"]
            normalized_price = normalize_number(information.get("pris", ""))
            normalized_priceSquareMeter = normalize_number(information.get("Pris/m²", ""))
            normalized_driftkostnad = normalize_number(information.get("Driftkostnad", ""))
            normalized_avgift = normalize_number(information.get("Avgift", ""))
            normalized_link = normalize_link(information.get("länk", ""))

            result =f"Detta är en beskriving på ett hus på adressen {information.get('adress', 'Ingen data')}\n\n" \
                    f"Pris: {normalized_price} \n" \
                    f"Bostadstyp: {information.get('Bostadstyp', 'Ingen data')}\n" \
                    f"Upplåtelseform: {information.get('Upplåtelseform', 'Ingen data')}\n" \
                    f"Antal rum: {information.get('Antal rum', 'Ingen data')}\n" \
                    f"Boarea: {information.get('Boarea', 'Ingen data')}\n" \
                    f"Balkong: {information.get('Balkong', 'Ingen data')}\n" \
                    f"Våning: {information.get('Våning', 'Ingen data')}\n" \
                    f"Byggår: {information.get('Byggår', 'Ingen data')}\n" \
                    f"Förening: {information.get('Förening', 'Ingen data')}\n" \
                    f"Avgift: {normalized_avgift}\n" \
                    f"Driftkostnad: {normalized_driftkostnad}\n" \
                    f"Pris/m²: {normalized_priceSquareMeter}\n" \
                    f"Antal besök: {information.get('Antal besök', 'Ingen data')}\n\n" \
                    f"Beskrivning:\n{information.get('description', 'Ingen data')}\n\n" \
                    f"Länk: {normalized_link}\n" 
            with open(file_path, 'w') as file:
                file.write(result)
        except Exception as e:
            print("Error creating file")




file_path = "../webbscraper/output.json"
my_list = load_list_from_json(file_path)
create_files_from_json(my_list)

