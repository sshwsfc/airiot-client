const configAtom = ({})

export const getConfig: any = () => {
  return configAtom
}

export const setConfig = (config: any) => {
  Object.assign(configAtom, config)
}
