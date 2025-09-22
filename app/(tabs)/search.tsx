import MovieCard from '@/components/MovieCard'
import SearchBar from '@/components/SearchBar'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { fetchMovies } from '@/services/api'
import { updateSearchCount } from '@/services/appwrite'
import useFetch from '@/services/useFetch'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native'

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [hasSearched, setHasSearched] = useState(false)

    const {
        data: movies, 
        loading: moviesLoading, 
        error: moviesError,
        refetch: loadMovies,
        reset,
    } = useFetch(() => fetchMovies({ query: debouncedQuery }), false)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim())
        }, 500)
        
        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    useEffect(() => {
        if (debouncedQuery) {
            setHasSearched(true)
            loadMovies()
        } else {
            reset()
            setHasSearched(false)
        }
    }, [debouncedQuery])

    useEffect(() => {
        const updateSearch = async () => {
            // Add null check for movies
            if (debouncedQuery && movies && movies.length > 0 && !moviesError) {
                try {
                    await updateSearchCount(debouncedQuery, movies[0])
                } catch (error) {
                    console.error("Failed to update search count:", error)
                }
            }
        }

        updateSearch()
    }, [movies, debouncedQuery, moviesError])
    
    return (
        <View className='flex-1 bg-primary'>
            <Image source={images.bg} className='flex-1 absolute w-full z-0' resizeMode='cover'/>

            <FlatList 
                // Handle null case by providing empty array
                data={movies || []} 
                renderItem={({item}) => <MovieCard {...item} />} 
                keyExtractor={(item) => item.id.toString()}
                className='px-5 '
                numColumns={3}
                columnWrapperStyle={{
                    justifyContent: "center",
                    gap: 16,
                    marginVertical: 16
                }}
                contentContainerStyle={{paddingBottom: 100}}
                ListHeaderComponent={
                    <>
                        <View className='w-full flex-row justify-center mt-20'>
                            <Image source={icons.logo} className='w-12 h-12' />
                        </View>
                        <View className='my-5'>
                            <SearchBar
                                placeholder="Search movies ..."
                                value={searchQuery}
                                onChangeText={(text: string) => setSearchQuery(text)} 
                            />
                        </View>
                        {moviesLoading && (
                            <ActivityIndicator size="large" color="#0000ff" className='my-3' />
                        )}

                        {moviesError && (
                            <Text className='text-red-500 px-5 my-3'>
                                Error: {moviesError.message}
                            </Text>
                        )}

                        {!moviesLoading && !moviesError && debouncedQuery && movies && movies.length > 0 && (
                            <Text className='text-xl text-white font-bold'>
                                Search Results for{' '}
                                <Text className='text-accent'>
                                    {debouncedQuery}
                                </Text>
                            </Text>
                        )}
                    </>
                }
                ListEmptyComponent={
                    !moviesLoading && !moviesError ? (
                        <View className='mt-10 px-5'>
                            <Text className='text-center text-gray-500'>
                                {hasSearched && debouncedQuery ? "No movies found" : "Search for a movie" }
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    )
}

export default Search