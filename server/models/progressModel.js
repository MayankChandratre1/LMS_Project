import { Schema, model } from 'mongoose'

const lectureProgressSchema = new Schema({
    lectureId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    timeSpent: {
        type: Number, // in seconds
        default: 0
    }
})

const dailyProgressSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    lecturesCompleted: {
        type: Number,
        default: 0
    },
    timeSpent: {
        type: Number, // in seconds
        default: 0
    },
    progressPercentage: {
        type: Number,
        default: 0
    }
})

const progressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    totalProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    totalTimeSpent: {
        type: Number, // in seconds
        default: 0
    },
    lectureProgress: [lectureProgressSchema],
    dailyProgress: [dailyProgressSchema],
    lastAccessedAt: {
        type: Date,
        default: Date.now
    },
    currentLecture: {
        type: Schema.Types.ObjectId
    }
}, { timestamps: true })

// Compound index for efficient queries
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true })
progressSchema.index({ userId: 1 })
progressSchema.index({ courseId: 1 })

// Methods to update progress
progressSchema.methods = {
    updateLectureProgress: function(lectureId, lectureTitle, timeSpent = 0) {
        const existingLecture = this.lectureProgress.find(
            lp => lp.lectureId.toString() === lectureId.toString()
        )
        
        if (existingLecture) {
            if (!existingLecture.completed) {
                existingLecture.completed = true
                existingLecture.completedAt = new Date()
            }
            existingLecture.timeSpent += timeSpent
        } else {
            this.lectureProgress.push({
                lectureId,
                title: lectureTitle,
                completed: true,
                completedAt: new Date(),
                timeSpent
            })
        }
        
        this.updateTotalProgress()
        this.updateDailyProgress(timeSpent)
        this.lastAccessedAt = new Date()
    },
    
    updateTotalProgress: function() {
        const totalLectures = this.lectureProgress.length
        const completedLectures = this.lectureProgress.filter(lp => lp.completed).length
        
        this.totalProgress = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0
        
        if (this.totalProgress === 100 && !this.isCompleted) {
            this.isCompleted = true
            this.completedAt = new Date()
        }
    },
    
    updateDailyProgress: function(timeSpent = 0) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        let todayProgress = this.dailyProgress.find(
            dp => dp.date.getTime() === today.getTime()
        )
        
        if (!todayProgress) {
            todayProgress = {
                date: today,
                lecturesCompleted: 0,
                timeSpent: 0,
                progressPercentage: this.totalProgress
            }
            this.dailyProgress.push(todayProgress)
        }
        
        // Update today's progress
        const completedToday = this.lectureProgress.filter(
            lp => lp.completedAt && 
            lp.completedAt >= today && 
            lp.completedAt < new Date(today.getTime() + 24 * 60 * 60 * 1000)
        ).length
        
        todayProgress.lecturesCompleted = completedToday
        todayProgress.timeSpent += timeSpent
        todayProgress.progressPercentage = this.totalProgress
        
        this.totalTimeSpent += timeSpent
    }
}

const Progress = model('Progress', progressSchema)

export default Progress
