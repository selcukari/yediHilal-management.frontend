export const calculateColumnWidthMember = (field: string): number | undefined => {
  const widthMap: {[key: string]: number} = {
    'id': 15,
    'fullName': 50,
    'telephone': 30,
    'email': 40,
    'isMessage': 10,
    'isMail': 10,
    'identificationNumber': 30,
    'dateOfBirth': 20,
    'countryName': 25,
    'provinceName': 30,
    'createdDate': 35
  };

  return widthMap[field] || undefined;
}

export const calculateColumnWidthUser = (field: string): number | undefined => {
  const widthMap: {[key: string]: number} = {
    'id': 15,
    'fullName': 55,
    'telephone': 30,
    'email': 45,
    'identificationNumber': 30,
    'dateOfBirth': 20,
    'countryName': 20,
    'provinceName': 25,
    'roleName': 25,
    'createdDate': 35
  };

  return widthMap[field] || undefined;
}
