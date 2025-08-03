export const calculateColumnWidth = (field: string): number | undefined => {
  const widthMap: {[key: string]: number} = {
    'id': 12,
    'fullName': 32,
    'telephone': 25,
    'email': 32,
    'identificationNumber': 20,
    'dateOfBirth': 20,
    'countryName': 20,
    'provinceName': 20,
    'roleName': 30,
    'createdDate': 32
  };

  return widthMap[field] || undefined;
}
