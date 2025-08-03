export const calculateColumnWidth = (field: string): number | undefined => {
  const widthMap: {[key: string]: number} = {
    'id': 12,
    'fullName': 32,
    'telephone': 25,
    'email': 34,
    'identificationNumber': 25,
    'dateOfBirth': 20,
    'countryName': 20,
    'provinceName': 20,
    'roleName': 30,
    'createdDate': 30
  };

  return widthMap[field] || undefined;
}
