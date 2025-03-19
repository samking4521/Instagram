import { View, ViewToken } from 'react-native'
import { useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';
import { useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import EditMediaCapture from '../editMediaCapture';
import CameraVision from './Camera';
import CaptureDelayTimer from './captureDelayTimer';
import MediaLibraryModal from './MediaLibraryModal';


export default function StoryCapture({ isFront }: { isFront: boolean }){
    const { hasPermission, requestPermission } = useCameraPermission();
    const { hasPermission: audioPermission, requestPermission: requestAudioPermission } = useMicrophonePermission();
    const [image, setImage] = useState<string | null>(null)
    const [video, setVideo] = useState<VideoType | null>(null)
    const [editCaptureModal, setEditCaptureModal] = useState(false)   
    const [timer, setTimer] = useState(0)
    const [showModal, setShowModal] = useState(false)
    const [currentViewableMedia, setCurrentViewableMedia] = useState<ViewToken>()
    const [allPhotos, setAllPhotos] = useState<CategorizedMedia[]>([])
    const [allVideos, setAllVideos] = useState<CategorizedMedia[]>([])
    const [allRecents, setAllRecents] = useState<CategorizedMedia[]>([])
    const [allCategorizedMedia, setAllCategorizedMedia] = useState<CategorizedMedia[]>([])
    const [completeCategorizedMedia, setCompleteCategorizedMedia] = useState<CategorizedMedia[]>([])
    const [openAddStoryModal, setOpenAddStoryModal] = useState(false)

    type CategorizedMedia = {
        id?: number,
        folderName: string,
        data: Assets[]
    }

    type VideoType = {
       duration: number,
       path: string
    }

    type Assets = {
      id: string,
      mediaType: string,
      uri: string,
      duration?: number
    }


useEffect(()=>{
  if(allPhotos.length == 0 || allVideos.length == 0 || allRecents.length == 0 || allCategorizedMedia.length == 0) return
  setCompleteCategorizedMedia([...allRecents, ...allPhotos, ...allVideos, ...allCategorizedMedia])

}, [allPhotos, allVideos, allRecents, allCategorizedMedia])

useEffect(()=>{
   getAllMedia('photo')
   getAllMedia('video')
   getAllMedia('recents')
   groupMediaByFolder()
}, [])

const getAllMedia = async(val: string)=>{
  try{
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: val == 'photo'? 'photo' : val == 'video'? 'video' : ['photo', 'video'],
        sortBy: [[MediaLibrary.SortBy.creationTime, false]], // Newest first
        first: 1000000// Fetch in batches (adjust as needed)
      });

      if(val == 'photo'){
          setAllPhotos([{
             id: 1,
             folderName: 'Photos',
             data: media.assets
          }])
      }else if(val == 'video'){
        setAllVideos([{
          id: 2,
          folderName: 'Videos',
          data: media.assets
       }])
      }else{
        setAllRecents([{
          id: 0,
          folderName: 'Recents',
          data: media.assets
       }])
      }
   }catch(e){
      console.log(`Error fetching all ${val == 'photo'? 'photos' : val == 'video'? 'videos' : 'recents'}: `, e)
   }
};


const groupMediaByFolder = async () => {
  // Get all albums (folders)
  const albums = await MediaLibrary.getAlbumsAsync();
  
  // Fetch photos per album (only returns metadata, NOT full files)
  const allMedia = await Promise.all(
    albums.map(async (album) => {
      const assets = await MediaLibrary.getAssetsAsync({
        album: album.id,
        first: 1000000, // Fetch all photos (adjust as needed)
        mediaType: ['photo', 'video']
      });

      return {
        folderName: album.title,
        data: assets.assets.map((asset) => asset),
      };
    })
  );

  
  // Filter out null values (empty folders)
  const filteredMedia = allMedia.filter((album) => album.data.length !== 0);
  setAllCategorizedMedia(filteredMedia)

};


    

  


  

 
    

useEffect(()=>{
   if(!hasPermission){
      requestPermission()
   }else{
    if(!audioPermission){
      requestAudioPermission()
    }
   }
}, [hasPermission])

    return(
        <View style={{flex: 1}}>

         {  editCaptureModal?
                  <>
                      {/* Photo or Video capture result with edit feature */}
                      <EditMediaCapture mode={'story'} video={video} setVideo={setVideo} photo={image} setImage={setImage} editCaptureModal={editCaptureModal} setEditCaptureModal={setEditCaptureModal} filterMatrice={currentViewableMedia?.item.matrice}  /> 
                  </>
                   : 
            <View style={{flex: 1, zIndex: 1}}>
               
                {/* Vision Camera Component*/}              
               <CameraVision 
               isFront={isFront} 
               setImage={setImage} 
               setVideo={setVideo} 
               setEditCaptureModal={setEditCaptureModal}
               timer={timer}
               setShowModal={setShowModal}
               currentViewableMedia={currentViewableMedia as ViewToken}
               setCurrentViewableMedia={setCurrentViewableMedia}
               setOpenAddStoryModal={setOpenAddStoryModal}
               />
        </View>
      }
     
        {/* Delay Capture Timer Modal*/}
       <CaptureDelayTimer showModal={showModal} setShowModal={setShowModal} setTimer={setTimer} />
        
        {/* Select Story From Media Modal*/}
        <MediaLibraryModal completeCategorizedMedia={completeCategorizedMedia} setImage={setImage} setVideo={setVideo} setEditCaptureModal={setEditCaptureModal} openAddStoryModal={openAddStoryModal} setOpenAddStoryModal={setOpenAddStoryModal}/>
            </View>
    )
}