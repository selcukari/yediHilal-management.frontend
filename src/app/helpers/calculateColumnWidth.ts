export const calculateColumnWidth = (field: string): number | undefined => {
  const widthMap: {[key: string]: number} = {
    'id': 12,
    'fullName': 30,
    'telephone': 25,
    'email': 30,
    'identificationNumber': 20,
    'dateOfBirth': 20,
    'countryName': 20,
    'provinceName': 20,
    'areaName': 40,
    'roleName': 30,
    'createdDate': 30
  };

  return widthMap[field] || undefined;
}
