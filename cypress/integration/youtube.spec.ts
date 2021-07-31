import {getVideoData} from '../../src/lib/youtube'

describe('Basic information are fetched correctly', () => {
  it('should get Never Gonna Give You Up', async () => {
    expect(await getVideoData('dQw4w9WgXcQ')).to.be.deep.equal({
      title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      author: 'Rick Astley',
      duration: 213
    })
  })
  it('should get Stranger In A Strange Land', async () => {
    expect(await getVideoData('1y0UxZAxq7s')).to.be.deep.equal({
      title: 'Stranger In A Strange Land',
      author: 'Thirty Seconds to Mars - Topic',
      duration: 415
    })
  })
  it('should get Seventh Son of a Seventh Son', async () => {
    expect(await getVideoData('AqelDw_Zoaw')).to.be.deep.equal({
      title:
        'WILDERUN - Seventh Son of a Seventh Son (OFFICIAL VIDEO - IRON MAIDEN COVER VERSION)',
      author: 'Century Media Records',
      duration: 619
    })
  })
})
