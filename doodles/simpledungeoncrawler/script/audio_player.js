class AudioPlayer
{
	constructor(sounds)
	{
		this.audioLibrary = sounds;
		
		this.audioContext = new AudioContext();
		this.tracks = {};
		for(var key in sounds)
		{
			this.tracks[key] = this.audioContext.createMediaElementSource(sounds[key]);
			this.tracks[key].connect(this.audioContext.destination);
		}
		this.soundEnabled = false;
	}
	
	toggleSound()
	{
		this.soundEnabled = !this.soundEnabled;
		if(this.soundEnabled) 
		{
			this.enableSound();
		}
		else 
		{
			this.disableSound();
		}
	}
	
	enableSound()
	{
		if(this.audioContext.state === "suspended")
		{
			this.audioContext.resume();
		}
	}
	
	disableSound()
	{
		for(var key in this.audioLibrary)
		{
			this.audioLibrary[key].pause();
		}
	}
	
	isSoundEnabled()
	{
		return this.soundEnabled;
	}
	
	playSound(key)
	{
		if(this.soundEnabled)
		{
			this.audioLibrary[key].play();
		}
	}
}

export default AudioPlayer;