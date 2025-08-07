export const calculateColumnWidthUser = (field: string): number | undefined => {
  const widthMap: {[key: string]: number} = {
    'id': 12,
    'fullName': 32,
    'telephone': 25,
    'email': 34,
    'identificationNumber': 24,
    'dateOfBirth': 20,
    'countryName': 18,
    'provinceName': 18,
    'createdDate': 30
  };

  return widthMap[field] || undefined;
}

export const calculateColumnWidthMember = (field: string): number | undefined => {
  const widthMap: {[key: string]: number} = {
    'id': 11,
    'fullName': 32,
    'telephone': 25,
    'email': 34,
    'identificationNumber': 25,
    'dateOfBirth': 17,
    'countryName': 18,
    'provinceName': 18,
    'roleName': 15,
    'createdDate': 30
  };

  return widthMap[field] || undefined;
}
