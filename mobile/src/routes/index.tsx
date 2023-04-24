import { useTheme, Box } from 'native-base'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'

import { AuthRoutes } from './auth.routes'
import { AppRoutes } from './app.routes'

import { useAuth } from '@hooks/useAuth'
import { Loading } from '@components/Loading'

export function Routes() {
    const { colors } = useTheme()
    const { user, isLoadingUserStorageData } = useAuth()

    function getLinking() {
        const prefixes = ['ignitegym://','exp+ignitegym://','com.cristianosilvadev.ignitegym://'];
      
        if (user.id) {
          return {
            prefixes,
            config: {
              screens: {
                home: {
                  path: 'home'
                },
                exercise: {
                  path: 'exercise/:exerciseId',
                  parse: {
                    exerciseId: (exerciseId: string) => exerciseId
                  }
                },
                history: {
                  path: 'history'
                },    
              },
            }
          }
        } else {
          return {
            prefixes,
            config: {
              screens: {
                signIn: {
                  path: 'signin'
                },
                signUp: {
                  path: 'signup'
                },
              }
            }
          }
        }
    }

    const linking = getLinking()

    const theme = DefaultTheme
    theme.colors.background = colors.gray[700]

    if(isLoadingUserStorageData){
        return <Loading />
    }

    return(
        <Box flex={1} bg={"gray.700"}>
            <NavigationContainer theme={theme} linking={linking}>
                {user.id ? <AppRoutes /> : <AuthRoutes/>}
            </NavigationContainer>
        </Box>
    )
}