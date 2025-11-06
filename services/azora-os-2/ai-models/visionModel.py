from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator

class VisionModel:
    def __init__(self, input_shape=(128, 128, 3), num_classes=10):
        self.model = Sequential()
        self.model.add(Conv2D(32, (3, 3), activation='relu', input_shape=input_shape))
        self.model.add(MaxPooling2D(pool_size=(2, 2)))
        self.model.add(Conv2D(64, (3, 3), activation='relu'))
        self.model.add(MaxPooling2D(pool_size=(2, 2)))
        self.model.add(Conv2D(128, (3, 3), activation='relu'))
        self.model.add(MaxPooling2D(pool_size=(2, 2)))
        self.model.add(Flatten())
        self.model.add(Dense(128, activation='relu'))
        self.model.add(Dropout(0.5))
        self.model.add(Dense(num_classes, activation='softmax'))

    def compile_model(self, learning_rate=0.001):
        self.model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    def train(self, train_data, validation_data, epochs=10, batch_size=32):
        train_datagen = ImageDataGenerator(rescale=1.0/255)
        validation_datagen = ImageDataGenerator(rescale=1.0/255)

        train_generator = train_datagen.flow_from_directory(
            train_data,
            target_size=(128, 128),
            batch_size=batch_size,
            class_mode='categorical'
        )

        validation_generator = validation_datagen.flow_from_directory(
            validation_data,
            target_size=(128, 128),
            batch_size=batch_size,
            class_mode='categorical'
        )

        self.model.fit(
            train_generator,
            steps_per_epoch=train_generator.samples // batch_size,
            validation_data=validation_generator,
            validation_steps=validation_generator.samples // batch_size,
            epochs=epochs
        )

    def save_model(self, filepath):
        self.model.save(filepath)

    def load_model(self, filepath):
        from tensorflow.keras.models import load_model
        self.model = load_model(filepath)