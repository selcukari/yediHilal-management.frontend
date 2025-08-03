export const calculateColumnWidth = (field: string): number | undefined => {
  const widthMap: {[key: string]: number} = {
    'id': 12,
    'fullName': 40,
    'telephone': 30,
    'email': 40,
    'identificationNumber': 20,
    'dateOfBirth': 20,
    'countryName': 20,
    'provinceName': 20,
    'areaName': 40,
    'roleName': 30,
    'createdDate': 30,
    'updateDate': 30
  };

  return widthMap[field] || undefined;
}
